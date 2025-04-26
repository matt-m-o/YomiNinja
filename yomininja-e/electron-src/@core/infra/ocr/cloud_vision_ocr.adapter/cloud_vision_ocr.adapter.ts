import { google } from "@google-cloud/vision/build/protos/protos";
import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, TextRecognitionModel, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { OcrItem, OcrItemBox, OcrItemBoxVertex, OcrResult, OcrResultContextResolution, OcrTextLine, OcrTextLineSymbol, OcrTextLineWord } from "../../../domain/ocr_result/ocr_result";
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

        this.status = OcrAdapterStatus.Enabled;
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

        this.idCounter++;

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

                block.paragraphs?.forEach( (paragraph, paragraphIdx) => {

                    const { words, boundingBox } = paragraph;

                    if ( !boundingBox?.vertices ) return;

                    const paragraphOcrBox = this.getOcrItemBox( boundingBox?.vertices );

                    const paragraphOcrBoxScalable =  OcrResultScalable.getBoxScalable(
                        paragraphOcrBox, contextResolution
                    );

                    const paragraphDimensions = paragraphOcrBoxScalable.dimensions;

                    const boxWidthPx = contextResolution.width * ( Number(paragraphDimensions?.width) / 100 );
                    const boxHeightPx = contextResolution.height * ( Number(paragraphDimensions?.height) / 100 );

                    const isVertical = boxHeightPx > boxWidthPx * 1.20 ;

                    const lines: OcrTextLine[] = [{
                        content: '',
                        symbols: [],
                        words: []
                    }];

                    let createNewLine = false;

                    words?.forEach(
                        word => {

                            let currentLine = lines[ lines.length - 1 ];

                            const wordBox = this.getOcrItemBox(
                                word?.boundingBox?.vertices || []
                            );

                            const newWord: OcrTextLineWord = {
                                box: wordBox,
                                word: ''
                            };

                            currentLine.words?.push(newWord);

                            word.symbols?.forEach( symbol => {

                                if ( createNewLine )
                                    lines.push({ content: '', symbols: []  });
                                
                                currentLine = lines[ lines.length - 1 ];

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

                                newWord.word += symbol.text || '';

                                currentLine.box = this.getLineBox( currentLine.symbols, isVertical );
                            });
                        }
                    );

                    if ( !boundingBox?.vertices ) return;

                    ocrResultItems.push({
                        id: paragraphIdx.toString(),
                        recognition_score: 1,
                        classification_score: 1,
                        classification_label: 0,
                        box: paragraphOcrBox,
                        text: lines,
                        recognition_state: 'RECOGNIZED'
                    });
                });

            });
        });

        const ocrResult = OcrResult.create({
            id: this.idCounter.toString() + this.name,
            context_resolution: contextResolution,
            results: ocrResultItems,
            image: input.imageBuffer
        });

        const resultScalable = OcrResultScalable.createFromOcrResult( ocrResult );
        resultScalable.ocr_engine_name = this.name;
        resultScalable.language = input.language;

        return resultScalable;
    }

    async getSupportedLanguages(): Promise< string[] > {
        return [];
    }

    async getSupportedModels(): Promise<TextRecognitionModel[]> {
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

    private getLineBox( lineSymbols: OcrTextLineSymbol[] | undefined, isVertical = false ): OcrItemBox | undefined {

        if ( !lineSymbols ) return;

        const firstBox = lineSymbols[0].box;
        const lastBox = lineSymbols[ lineSymbols.length-1 ].box;

        if ( isVertical ) {
            return {
                top_left: firstBox.top_left,
                top_right: firstBox.top_right,
                bottom_left: lastBox.bottom_left,
                bottom_right: lastBox.bottom_right
            }
        }

        return {
            top_left: firstBox.top_left,
            top_right: lastBox.top_right,
            bottom_left: firstBox.bottom_left,
            bottom_right: lastBox.bottom_right
        };
    }
}