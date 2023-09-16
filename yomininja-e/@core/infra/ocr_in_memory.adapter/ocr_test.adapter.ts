import { OcrResult, OcrResultProperties } from "../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrAdapterStatus, OcrRecognitionInput } from "../../application/adapters/ocr.adapter";

export class OcrTestAdapter implements OcrAdapter {

    static _name: string = "OcrTestAdapter";
    public readonly name: string = OcrTestAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;

    constructor(
        public baseResultProps: OcrResultProperties,
        public supportedLanguages: string[],
    ) {}

    initialize() {
        this.status = OcrAdapterStatus.Enabled; 
    }

    async recognize(input: OcrRecognitionInput ): Promise< OcrResult > {

        if ( this.status != OcrAdapterStatus.Enabled )
            return;

        const result = OcrResult.create({
            id: input.id,
            props: this.baseResultProps,
        });

        result.results[0].text = input.imageBuffer.toString();

        return result;
    }
    async getSupportedLanguages(): Promise< string[] > {        
        
        return this.supportedLanguages;
    }
}