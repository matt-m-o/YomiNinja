import { OcrItem, OcrResult, OcrResultContextResolution, OcrResult_CreationInput } from "../../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";
import { PpOcrEngineSettings, getPpOcrDefaultSettings } from "../../ocr/ppocr.adapter/ppocr_settings";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";

const ocrTestAdapterResultProps: OcrResult_CreationInput = {
    id: '1',
    context_resolution: {
        width: 1920,
        height: 1080,                        
    },
    results: [
        {
            text: [{ content: "recognized_text" }],
            recognition_score: 0.99,
            classification_score: 0.99,
            classification_label: 1,
            box: {
                top_left: { x: 0, y: 0 },
                top_right: { x: 10, y: 0 },
                bottom_left: { x: 0, y: 10 },
                bottom_right: { x: 10, y: 10 },
            }
        }
    ]
};

export type FakeOcrEngineSettings = PpOcrEngineSettings;

export class FakeOcrTestAdapter implements OcrAdapter< FakeOcrEngineSettings > {

    static _name: string = "OcrTestAdapter";
    public readonly name: string = FakeOcrTestAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;

    constructor(
        public baseResultProps: OcrResult_CreationInput = ocrTestAdapterResultProps,
        public supportedLanguages: string[] = [ "en", "ja" ],
    ) {}    

    initialize() {
        this.status = OcrAdapterStatus.Enabled; 
    }

    async recognize(input: OcrRecognitionInput ): Promise< OcrResultScalable | null > {

        this.idCounter++;

        if ( this.status != OcrAdapterStatus.Enabled )
            return null;

        const result = OcrResult.create({
            ...this.baseResultProps,
            id: this.idCounter.toString(),
        });

        result.results[0].text =[
            { content: input.imageBuffer.toString() }
        ];

        return OcrResultScalable.createFromOcrResult(result);
    }
    async getSupportedLanguages(): Promise< string[] > {        
        
        return this.supportedLanguages;
    }

    async updateSettings(
        settingsUpdate: FakeOcrEngineSettings,
        oldSettings?: FakeOcrEngineSettings
    ): Promise< UpdateOcrAdapterSettingsOutput< FakeOcrEngineSettings > > {

        let restart = false;

        if (
            !oldSettings ||
            oldSettings?.cpu_threads != settingsUpdate.cpu_threads ||
            oldSettings?.max_image_width != settingsUpdate.max_image_width ||
            oldSettings?.inference_runtime != settingsUpdate.inference_runtime
        )
            restart = true;

        return {
            settings: settingsUpdate,
            restart
        };
    }

    getDefaultSettings(): FakeOcrEngineSettings {
        return {
            ...getPpOcrDefaultSettings(),
            ocr_adapter_name: FakeOcrTestAdapter._name
        };
    }

    getSettingsOptions(): OcrEngineSettingsOptions {
        return {
            inference_runtime: [
                {
                    value: 'ONNX_CPU',
                    displayName: 'ONNX CPU'
                }
            ]
        }
    }

    restart( callback: () => void ): void {
        callback();
    }
}