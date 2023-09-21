import { OcrItem, OcrResult } from "../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrAdapterStatus, OcrRecognitionInput } from "../../application/adapters/ocr.adapter";
import * as grpc from '@grpc/grpc-js';
import { OCRServiceClient } from "../../../../grpc/rpc/ocr_service/OCRService";
import { RecognizeDefaultResponse__Output } from "../../../../grpc/rpc/ocr_service/RecognizeDefaultResponse";
import { GetSupportedLanguagesResponse__Output } from "../../../../grpc/rpc/ocr_service/GetSupportedLanguagesResponse";
import { ocrServiceProto } from "../../../../grpc/grpc_protos";
import { RecognizeBytesRequest } from "../../../../grpc/rpc/ocr_service/RecognizeBytesRequest";
import { join } from "path";
import { spawn } from 'child_process';
import { dialog } from 'electron';
import isDev from 'electron-is-dev';
import { BIN_DIR } from "../../../util/directories";


export class PpOcrAdapter implements OcrAdapter {

    static _name: string = "OcrPpOcrAdapter";
    public readonly name: string = PpOcrAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private ocrServiceClient: OCRServiceClient | null = null;

    constructor() {

        this.startProcess();
    }

    initialize( serviceAddress?: string ) {

        
        if ( !serviceAddress )
            return;
    
        console.log("initializing wih address: "+ serviceAddress );

        this.ocrServiceClient = new ocrServiceProto.ocr_service.OCRService(
            serviceAddress,
            grpc.credentials.createInsecure()
        );
        this.status = OcrAdapterStatus.Enabled;
    }

    async recognize( input: OcrRecognitionInput ): Promise< OcrResult | null > {

        console.time('PpOcrAdapter.recognize');
        
        if ( this.status != OcrAdapterStatus.Enabled )
            return null;        

        const requestInput: RecognizeBytesRequest = {
            id: input.id.toString(),
            image_bytes: input.imageBuffer,
            language_code: input.languageCode            
        };        
        
        const clientResponse = await new Promise< RecognizeDefaultResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.RecognizeBytes( requestInput, ( error, response ) => {
                if (error) {
                    return reject(error)
                }
                resolve(response);
            })
        );

        if ( !clientResponse )
            return null;
        
        if (
            !clientResponse?.context_resolution ||
            !clientResponse?.results
        )
            return null;
        
        console.timeEnd('PpOcrAdapter.recognize');
        // return null;
        return OcrResult.create({
            id: input.id,            
            context_resolution: clientResponse.context_resolution,
            results: clientResponse.results as OcrItem[],            
        });        
    }

    async getSupportedLanguages(): Promise< string[] > {

        if ( !this.ocrServiceClient )
            return [];
        
        const clientResponse = await new Promise< GetSupportedLanguagesResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.GetSupportedLanguages( {}, ( error, response ) => {
                if (error) {
                    return reject(error)
                }
                resolve(response);
            })
        );
        
        if ( !clientResponse )
            return [];

        // console.log( clientResponse );
        
        return clientResponse.language_codes;
    }

    startProcess() {

        const cwd = isDev
        ? join( BIN_DIR, '/ppocr' )
        : join( process.resourcesPath, '/bin/ppocr/' );

        // let cwd = join( __dirname, "../../../../../../bin/ppocr" );
        const executable = join( cwd + "/ppocr_infer_service_grpc.exe" );

        // Replace 'your_program.exe' with the actual .exe file path you want to run
        const childProcess = spawn( executable, [/* command line arguments */], { cwd } );

        // Handle stdout and stderr data
        childProcess.stdout.on('data', ( data: string ) => {

            if ( data.includes('[INFO-JSON]:') ) {

                const jsonData = JSON.parse( data.toString().split('[INFO-JSON]:')[1] );

                if ( 'server_address' in jsonData )
                    this.initialize( jsonData.server_address );                                
            }
            
            console.log(`stdout: ${data}`);        
        });

        childProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        // Handle process exit
        childProcess.on('close', (code) => {
            console.log(`ppocr_infer_service_grpc.exe process exited with code ${code}`);
        });

        process.on('exit', () => {
            // Ensure the child process is killed before exiting
            childProcess.kill('SIGTERM'); // You can use 'SIGINT' or 'SIGKILL' as well
        });
          
    }
}