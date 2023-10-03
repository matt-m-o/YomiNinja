import { OcrItem, OcrResult, OcrResultContextResolution, OcrResult_CreationInput } from "../../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrAdapterStatus, OcrRecognitionInput } from "../../../application/adapters/ocr.adapter";
import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";

const ocrTestAdapterResultProps: OcrResult_CreationInput = {
    id: 1,
    context_resolution: {
        width: 1920,
        height: 1080,                        
    },
    results: [
        {
            text: "recognized_text",
            score: 0.99,
            box: {
                top_left: { x: 0, y: 0 },
                top_right: { x: 10, y: 0 },
                bottom_left: { x: 0, y: 10 },
                bottom_right: { x: 10, y: 10 },
            }
        }
    ]
};

export class FakeOcrTestAdapter implements OcrAdapter {

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

    async recognize(input: OcrRecognitionInput ): Promise< OcrResult | null > {

        this.idCounter++;

        if ( this.status != OcrAdapterStatus.Enabled )
            return null;

        const result = OcrResult.create({
            ...this.baseResultProps,
            id: this.idCounter,
        });

        result.results[0].text = input.imageBuffer.toString();

        return result;
    }
    async getSupportedLanguages(): Promise< string[] > {        
        
        return this.supportedLanguages;
    }

    async updateSettings( input: OcrEngineSettings ): Promise< boolean > {
        return true;
    }

    restart( callback: () => void ): void {
        callback();
    }
}