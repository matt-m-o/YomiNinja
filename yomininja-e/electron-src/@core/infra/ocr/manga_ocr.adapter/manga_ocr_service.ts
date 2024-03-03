import { OcrItemBox } from "../../../domain/ocr_result/ocr_result";

export type MangaOcrCropAndRecognize_Input = {
    image: Buffer;
    boxes: OcrItemBox[];
};

export type MangaOcrRecognize_Input = {
    textImages: Buffer[];
};


export interface MangaOcrService {
    recognize: ( input: MangaOcrRecognize_Input  ) => Promise< string[][] >;
    cropAndRecognize: ( input: MangaOcrCropAndRecognize_Input ) => Promise< string[][] >;
};