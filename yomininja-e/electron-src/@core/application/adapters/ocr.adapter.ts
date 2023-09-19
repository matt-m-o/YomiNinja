import { OcrResult } from "../../domain/ocr_result/ocr_result";

export type OcrRecognitionInput = {
    id: number;
    imageBuffer: Buffer;
    languageCode: string;
};

export interface OcrAdapter {
    name: string;
    status: OcrAdapterStatus;
    initialize: () => void;
    recognize: ( input: OcrRecognitionInput ) => Promise< OcrResult | null >;
    getSupportedLanguages: () => Promise< string[] >; // Get this by calling the grpc stub or reading it's config files
}

export enum OcrAdapterStatus {
    Enabled = "Enabled",
    Disabled = "Disabled"    
}