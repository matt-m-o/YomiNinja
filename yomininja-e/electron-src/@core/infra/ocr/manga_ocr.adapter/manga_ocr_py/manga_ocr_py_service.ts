import { ocrServiceProto } from "../../../../../../grpc/grpc_protos";
import { DetectRequest } from "../../../../../../grpc/rpc/ocr_service/DetectRequest";
import { DetectResponse__Output } from "../../../../../../grpc/rpc/ocr_service/DetectResponse";
import { OCRServiceClient } from "../../../../../../grpc/rpc/ocr_service/OCRService";
import { OcrItemBox, OcrResult } from "../../../../domain/ocr_result/ocr_result";
import { pyOcrService } from "../../py_ocr_service/_temp_index";
import { MangaOcrRecognize_Input, MangaOcrService } from "../manga_ocr_service";
import * as grpc from '@grpc/grpc-js';


export class MangaOcrPyService implements MangaOcrService {

    paddleOcrClient: OCRServiceClient;

    constructor() {
        this.paddleOcrClient = new ocrServiceProto.ocr_service.OCRService(
            '0.0.0.0:12345',
            grpc.credentials.createInsecure(),
        );
    }

    async recognize( input: MangaOcrRecognize_Input ): Promise< OcrResult | null > {

        console.time("paddleOcrDetection");
        const boxes: OcrItemBox[] = await this.paddleOcrDetection(
            input.image,
            input.id
        );
        console.timeEnd("paddleOcrDetection");

        console.time("MangaOCR Recognize");
        const result = await pyOcrService.recognize({
            id: input.id,
            image: input.image,
            languageCode: 'ja',
            ocrEngine: 'MangaOCR',
            boxes
        });
        console.timeEnd("MangaOCR Recognize");

        return result;
    };

    async paddleOcrDetection( image: Buffer, id: string ): Promise< OcrItemBox[] > {

        const input: DetectRequest = {
            id: id,
            crop_image: false,
            image_bytes: image,
            language_code: 'ja'
        }

        const clientResponse = await new Promise< DetectResponse__Output | undefined >(
            (resolve, reject) => this.paddleOcrClient?.Detect( input, ( error, response ) => {
                if (error) {
                    return reject(error)
                }
                resolve(response);
            })
        );
            
        if ( !clientResponse ) return [];

        const results: OcrItemBox[] = clientResponse.results.map( item => item.box )
            .filter( item => item !== null ) as OcrItemBox[];

        return results;
    }

}