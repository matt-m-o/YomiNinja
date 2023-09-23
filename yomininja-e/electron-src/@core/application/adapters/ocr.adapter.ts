import { OcrResult } from "../../domain/ocr_result/ocr_result";

export type OcrRecognitionInput = {    
    imageBuffer: Buffer;
    languageCode: string;
};

export interface OcrAdapter {     
    name: string;
    status: OcrAdapterStatus;
    initialize: ( serviceAddress?: string ) => void;
    recognize: ( input: OcrRecognitionInput ) => Promise< OcrResult | null >;
    getSupportedLanguages: () => Promise< string[] >; // Get this by calling the grpc stub or reading it's config files
}

export enum OcrAdapterStatus {
    Enabled = "Enabled",
    Disabled = "Disabled"    
}