import { google } from "@google-cloud/vision/build/protos/protos";
import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { OcrItem, OcrItemBox, OcrItemBoxVertex, OcrResult, OcrResultContextResolution, OcrTextLine } from "../../../domain/ocr_result/ocr_result";
import { CloudVisionAPICredentials, CloudVisionApi } from "./cloud_vision_api";
import { CloudVisionAPIMode, CloudVisionOcrEngineSettings, cloudVisionOcrAdapterName, getCloudVisionDefaultSettings } from "./cloud_vision_ocr_settings";
import { OcrEngineSettingsU } from "../../types/entity_instance.types";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";

export class CloudVisionOcrAdapter implements OcrAdapter< CloudVisionOcrEngineSettings > {

    static _name: string = cloudVisionOcrAdapterName;
    public readonly name: string = CloudVisionOcrAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;

    private api: CloudVisionApi;
    private testApi: CloudVisionApi;
    private apiMode: CloudVisionAPIMode;

    constructor(
        api: CloudVisionApi,
        testApi?: CloudVisionApi
    ) {

        this.api = api;

        if ( testApi )
            this.testApi = testApi;
    }

    initialize( serviceAddress?: string | undefined ) {}

    async recognize( input: OcrRecognitionInput ): Promise< OcrResultScalable | null > {

        const { imageBuffer, language } = input;

        let api: CloudVisionApi;
        

        if ( this.apiMode === 'demo' ) {
            api = this.testApi;
            console.log('Using Cloud Vision Demo API');
        }
        else if ( this.apiMode === 'main' ) {
            api = this.api;
            console.log('Using Cloud Vision Main API');
        }
        else {
            return null;
        }

        const result = await api.textDetection( imageBuffer );

        if ( !result ) return null;

        const ocrResultItems: OcrItem[] = [];

        let contextResolution: OcrResultContextResolution = {
            width: 0,
            height: 0
        };

        result?.fullTextAnnotation?.pages?.forEach( page => {

            if ( !page.width || !page.height )
                return;

            contextResolution = {
                width: page.width,
                height: page.height
            };

            page.blocks?.forEach( block => {

                block.paragraphs?.forEach( paragraph => {

                    const { words, boundingBox } = paragraph;

                    const lines: OcrTextLine[] = [{
                        content: '',
                        symbols: []
                    }];

                    let createNewLine = false;

                    words?.forEach(
                        word => word.symbols?.forEach( symbol => {

                            if ( createNewLine )
                                lines.push({ content: '', symbols: [] });

                            const currentLine = lines[ lines.length - 1 ];

                            const breakType = symbol.property?.detectedBreak?.type;

                            let breakChar = '';

                            if ( breakType == 'SPACE' )
                                breakChar = " ";

                            if ( breakType == 'SURE_SPACE' )
                                breakChar = "　";

                            if ( breakType == 'EOL_SURE_SPACE' )
                                breakChar = " ";

                            if ( breakType == 'HYPHEN' )
                                breakChar = "-";

                            if ( breakType == 'UNKNOWN' )
                                breakChar = " ";

                            
                            if (
                                breakType === 'LINE_BREAK' ||
                                breakType === 'EOL_SURE_SPACE' ||
                                breakType === 'HYPHEN'
                            )
                                createNewLine = true;
                            else 
                                createNewLine = false;

                            currentLine.content += symbol.text + breakChar;

                            const symbolBox = this.getOcrItemBox(
                                symbol?.boundingBox?.vertices || []
                            );
                            
                            currentLine.symbols?.push({
                                symbol: symbol.text || '',
                                box: symbolBox
                            });

                        })
                    );

                    if ( !boundingBox?.vertices ) return;

                    ocrResultItems.push({
                        recognition_score: 1,
                        classification_score: 1,
                        classification_label: 0,
                        box: this.getOcrItemBox( boundingBox?.vertices ),
                        text: lines
                    });
                });

            });
        });

        const ocrResult = OcrResult.create({
            id: this.idCounter.toString() + this.name,
            context_resolution: contextResolution,
            results: ocrResultItems,
        });

        return OcrResultScalable.createFromOcrResult( ocrResult );
    }

    async getSupportedLanguages(): Promise< string[] > {
        return [];
    }

    async updateSettings(
        _settingsUpdate: OcrEngineSettingsU,
        _oldSettings?: OcrEngineSettingsU | undefined
    ): Promise< UpdateOcrAdapterSettingsOutput< CloudVisionOcrEngineSettings > > {

        // TODO: Settings validation

        let settingsUpdate = _settingsUpdate as CloudVisionOcrEngineSettings;
        let oldSettings = _oldSettings as CloudVisionOcrEngineSettings;

        const credentials: CloudVisionAPICredentials = {
            clientEmail: settingsUpdate?.client_email,
            privateKey: settingsUpdate?.private_key,
            token: settingsUpdate?.token
        };

        this.api.updateCredentials( credentials );
        this.testApi.updateCredentials( credentials );
        this.apiMode = settingsUpdate.active_api;

        return {
            restart: false,
            settings: settingsUpdate
        }
    }

    getDefaultSettings(): CloudVisionOcrEngineSettings {
        return getCloudVisionDefaultSettings();
    }

    getSettingsOptions: () => OcrEngineSettingsOptions;

    restart = async ( callback: () => void ) => {
        callback();
    };

    private getOcrItemBox(
        vertices: google.cloud.vision.v1.IVertex[]
    ): OcrItemBox {
        return {
            top_left: this.getOcrItemBoxVertex( vertices[0] ),
            top_right: this.getOcrItemBoxVertex( vertices[1] ),
            bottom_right: this.getOcrItemBoxVertex( vertices[2] ),
            bottom_left: this.getOcrItemBoxVertex( vertices[3] ),
        };
    }

    private getOcrItemBoxVertex(
        cloudVisionVertex: google.cloud.vision.v1.IVertex
    ): OcrItemBoxVertex {
        return {
            x: cloudVisionVertex?.x || 0,
            y: cloudVisionVertex?.y || 0,
        };
    }
}