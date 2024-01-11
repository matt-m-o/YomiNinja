import { google } from "@google-cloud/vision/build/protos/protos";
import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { OcrItem, OcrItemBox, OcrItemBoxVertex, OcrResult, OcrResultContextResolution } from "../../../domain/ocr_result/ocr_result";
import { CloudVisionApi } from "./cloud_vision_api";
import { CloudVisionOcrEngineSettings, cloudVisionOcrAdapterName, getCloudVisionDefaultSettings } from "./cloud_vision_ocr_settings";

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

                    const flatParagraph = words?.map(
                            word => word.symbols?.map( symbol => symbol.text ).join('') 
                        ).join('');

                    if (
                        !flatParagraph ||
                        !boundingBox?.vertices
                    ) return;

                    ocrResultItems.push({
                        recognition_score: 1,
                        classification_score: 1,
                        classification_label: 0,
                        box: this.getOcrItemBox( boundingBox?.vertices ),
                        text: flatParagraph
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
        settingsUpdate: CloudVisionOcrEngineSettings,
        oldSettings?: CloudVisionOcrEngineSettings | undefined
    ): Promise< UpdateOcrAdapterSettingsOutput< CloudVisionOcrEngineSettings > > {

        // TODO: Settings validation

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