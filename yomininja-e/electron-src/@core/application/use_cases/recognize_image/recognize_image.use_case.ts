import { OcrResult } from "../../../domain/ocr_result/ocr_result";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { OcrAdapter } from "../../adapters/ocr.adapter";


export type RecognizeImageInput = {
    ocrAdapterName: string;
    imageBuffer: Buffer;
    languageCode: string;
}

export class RecognizeImageUseCase {

    constructor( public ocrAdapters: OcrAdapter[] ) {}

    async execute( input: RecognizeImageInput ): Promise< OcrResultScalable | null > {

        const adapter = this.getAdapter( input.ocrAdapterName );

        if ( !adapter )
            return null;        

        const ocrResult = await adapter.recognize({            
            imageBuffer: input.imageBuffer,
            languageCode: input.languageCode,
        });

        if ( !ocrResult )
            return null;        

        return OcrResultScalable.createFromOcrResult( ocrResult );
    }

    private getAdapter( adapterName: string ): OcrAdapter | null {
        return this.ocrAdapters.find( adapter => adapter.name === adapterName ) || null;
    }
}