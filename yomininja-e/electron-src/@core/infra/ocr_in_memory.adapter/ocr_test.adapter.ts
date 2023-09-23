import { OcrItem, OcrResult, OcrResultContextResolution, OcrResult_CreationInput } from "../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrAdapterStatus, OcrRecognitionInput } from "../../application/adapters/ocr.adapter";

export class OcrTestAdapter implements OcrAdapter {

    static _name: string = "OcrTestAdapter";
    public readonly name: string = OcrTestAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;

    constructor(
        public baseResultProps: OcrResult_CreationInput,
        public supportedLanguages: string[],
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
}