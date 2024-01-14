import { google } from "@google-cloud/vision/build/protos/protos";
import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { OcrItem, OcrItemBox, OcrItemBoxVertex, OcrResult, OcrResultContextResolution, OcrTextLine } from "../../../domain/ocr_result/ocr_result";
import { CloudVisionApi } from "./cloud_vision_api";
import { CloudVisionOcrEngineSettings, cloudVisionOcrAdapterName, getCloudVisionDefaultSettings } from "./cloud_vision_ocr_settings";
import { OcrEngineSettingsU } from "../../types/entity_instance.types";

export class CloudVisionOcrAdapter implements OcrAdapter< CloudVisionOcrEngineSettings > {

    static _name: string = cloudVisionOcrAdapterName;
    public readonly name: string = CloudVisionOcrAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;

    private api: CloudVisionApi;

    constructor( api: CloudVisionApi ) {
        this.api = api;
    }

    initialize( serviceAddress?: string | undefined ) {}

    async recognize( input: OcrRecognitionInput ): Promise< OcrResult | null > {

        const { imageBuffer, languageCode } = input;

        const result = await this.api.textDetection( imageBuffer );

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

        return OcrResult.create({
            id: this.idCounter,
            context_resolution: contextResolution,
            results: ocrResultItems,
        });
    }

    async getSupportedLanguages(): Promise< string[] > {
        return [];
    }

    async updateSettings(
        settingsUpdate: OcrEngineSettingsU,
        oldSettings?: OcrEngineSettingsU | undefined
    ): Promise< UpdateOcrAdapterSettingsOutput< CloudVisionOcrEngineSettings > > {

        // TODO: Settings validation

        settingsUpdate = settingsUpdate as CloudVisionOcrEngineSettings;
        oldSettings = settingsUpdate as CloudVisionOcrEngineSettings;

        return {
            restart: false,
            settings: settingsUpdate
        }
    }

    getDefaultSettings(): CloudVisionOcrEngineSettings {
        return getCloudVisionDefaultSettings();
    }

    getSettingsOptions: () => OcrEngineSettingsOptions;

    restart: ( callback: () => void) => void;

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