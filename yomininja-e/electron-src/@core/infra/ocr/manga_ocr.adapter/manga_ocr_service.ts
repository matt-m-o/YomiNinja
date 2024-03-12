import { OcrItemBox, OcrResult } from "../../../domain/ocr_result/ocr_result";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";

export type MangaOcrRecognize_Input = {
    id: string;
    image: Buffer;
    boxes?: OcrItemBox[];
};


export interface MangaOcrService {
    recognize: ( input: MangaOcrRecognize_Input ) => Promise< OcrResult | null >;
};