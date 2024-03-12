import { OCRServiceClient } from "../../../../../grpc/rpc/ocr_service/OCRService";
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { ocrServiceProto } from "../../../../../grpc/grpc_protos";
import * as grpc from '@grpc/grpc-js';
import { OcrAdapterStatus } from "../../../application/adapters/ocr.adapter";
import { OcrItem, OcrItemBox, OcrResult } from "../../../domain/ocr_result/ocr_result";
import { RecognizeDefaultResponse__Output } from "../../../../../grpc/rpc/ocr_service/RecognizeDefaultResponse";
import { RecognizeBase64Request } from "../../../../../grpc/rpc/ocr_service/RecognizeBase64Request";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";

export class PyOcrService {

    private ocrServiceClient: OCRServiceClient | null = null;
    private ocrServiceProcess: ChildProcessWithoutNullStreams;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    // private binRoot: string;

    initialize( serviceAddress: string = '0.0.0.0:23456' ) {
        
        if ( !serviceAddress )
            return;
    
        console.log("Initializing PyOcrService wih address: "+ serviceAddress );

        this.ocrServiceClient = new ocrServiceProto.ocr_service.OCRService(
            serviceAddress,
            grpc.credentials.createInsecure(),
        );

        this.status = OcrAdapterStatus.Enabled;
    }

    async recognize(
        input: {
            id: string;
            image: Buffer;
            ocrEngine: 'MangaOCR' | string;
            languageCode: string;
            boxes?: OcrItemBox[]
        }
    ): Promise< OcrResult | null > {

        const requestInput: RecognizeBase64Request = {
            id: input.id,
            base64_image: input.image.toString( 'base64' ),
            ocr_engine: input.ocrEngine,
            boxes: input?.boxes || [],
            language_code: input.languageCode
        };

        this.status = OcrAdapterStatus.Processing;
        // console.time('PpOcrAdapter.recognize');        
        const clientResponse = await new Promise< RecognizeDefaultResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.RecognizeBase64( requestInput, ( error, response ) => {
                if (error) {
                    this.restart( () => {} );
                    return reject(error)
                }
                resolve(response);
            })
        );
        // console.timeEnd('PpOcrAdapter.recognize');
        this.status = OcrAdapterStatus.Enabled;

        if ( !clientResponse )
            return null;
        
        if (
            !clientResponse?.context_resolution ||
            !clientResponse?.results
        )
            return null;
        
        const ocrItems: OcrItem[] = clientResponse.results.map( ( item ) => {
            return {
                ...item,
                text: [{
                    content: item.text
                }],
            } as OcrItem
        });

        const result = OcrResult.create({
            id: parseInt(clientResponse.id),
            context_resolution: clientResponse.context_resolution,
            results: ocrItems,
        });

        console.log( clientResponse );

        return result;

    }

    restart( callback: () => void ) {

    }
}