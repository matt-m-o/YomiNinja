import { OcrResult } from "../../../domain/ocr_result/ocr_result";

export type AppleVisionRecognize_Input = {
    id: string;
    image: Buffer;
    languageCode: string;
};


export interface AppleVisionService {
    recognize: ( input: AppleVisionRecognize_Input ) => Promise< OcrResult | null >;
    getSupportedLanguages: () => Promise< string[] >;
};