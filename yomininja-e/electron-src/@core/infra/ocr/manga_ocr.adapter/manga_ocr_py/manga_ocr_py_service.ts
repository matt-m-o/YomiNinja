import { TextRecognitionModel } from "../../../../../../grpc/rpc/ocr_service/TextRecognitionModel";
import { OcrAdapterStatus } from "../../../../application/adapters/ocr.adapter";
import { OcrItemBox, OcrResult } from "../../../../domain/ocr_result/ocr_result";
import { paddleOcrService } from "../../ocr_services/paddle_ocr_service/_temp_index";
import { pyOcrService } from "../../ocr_services/py_ocr_service/_temp_index";
import { MangaOcrRecognize_Input, MangaOcrService } from "../manga_ocr_service";


export class MangaOcrPyService implements MangaOcrService {

    private readonly ocrEngineName = 'MangaOCR';

    get status(): OcrAdapterStatus {
        return pyOcrService.status;
    }

    async recognize( input: MangaOcrRecognize_Input ): Promise< OcrResult | null > {

        let boxes: OcrItemBox[] | undefined;

        if ( input.text_detector === 'PaddleTextDetector' ) {
            console.time("PaddleTextDetector");
            boxes = await this.paddleOcrDetection(
                input.image,
                input.id
            );
            console.timeEnd("PaddleTextDetector");

            if ( !boxes?.length ) return null;
        }

        console.time("MangaOCR Recognize");
        const result = await pyOcrService.recognize({
            id: input.id,
            image: input.image,
            languageCode: 'ja',
            ocrEngine: this.ocrEngineName,
            boxes
        });
        console.timeEnd("MangaOCR Recognize");

        return result;
    };

    async paddleOcrDetection( image: Buffer, id: string ): Promise< OcrItemBox[] > {
        return await paddleOcrService.detect(
            {
                id,
                crop_image: false,
                image_bytes: image,
                language_code: 'ja-JP'
            },
            id
        );
    }

    async getSupportedModels(): Promise< TextRecognitionModel[] > { 
        return await pyOcrService.getSupportedModels( this.ocrEngineName )
    }

    async installModel( modelName: string ): Promise< boolean > {
        const result = await pyOcrService.installModel( this.ocrEngineName, modelName );
        return result?.success || false;
    }
}