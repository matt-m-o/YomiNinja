import { OcrResult } from "../../../domain/ocr_result/ocr_result";
import { OcrAdapter } from "../../adapters/ocr.adapter";


export type RecognizeImageInput = {
    ocrAdapterName: string;
    imageBuffer: Buffer;
    languageCode: string;
}

export class RecognizeImageUseCase {

    private idCounter = 0;

    constructor( public ocrAdapters: OcrAdapter[] ) {}

    async execute( input: RecognizeImageInput ): Promise< OcrResult | null > {

        const adapter = this.getAdapter( input.ocrAdapterName );

        if ( !adapter )
            return null;

        this.idCounter++;

        return await adapter.recognize({
            id: this.idCounter,
            imageBuffer: input.imageBuffer,
            languageCode: input.languageCode,
        });
    }

    private getAdapter( adapterName: string ): OcrAdapter | null {
        return this.ocrAdapters.find( adapter => adapter.name === adapterName ) || null;
    }
}