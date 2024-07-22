import { OCRServiceClient } from "../../../../../grpc/rpc/ocr_service/OCRService";
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { ocrServiceProto } from "../../../../../grpc/grpc_protos";
import * as grpc from '@grpc/grpc-js';
import { OcrAdapterStatus } from "../../../application/adapters/ocr.adapter";
import { OcrItem, OcrItemBox, OcrResult } from "../../../domain/ocr_result/ocr_result";
import { RecognizeDefaultResponse__Output } from "../../../../../grpc/rpc/ocr_service/RecognizeDefaultResponse";
import { RecognizeBase64Request } from "../../../../../grpc/rpc/ocr_service/RecognizeBase64Request";
import os from 'os';
import { join } from "path";
import isDev from 'electron-is-dev';
import { BIN_DIR } from "../../../../util/directories.util";
import { GetSupportedLanguagesRequest } from "../../../../../grpc/rpc/ocr_service/GetSupportedLanguagesRequest";
import { GetSupportedLanguagesResponse__Output } from "../../../../../grpc/rpc/ocr_service/GetSupportedLanguagesResponse";
import { MotionDetectionRequest } from "../../../../../grpc/rpc/ocr_service/MotionDetectionRequest";
import { MotionDetectionResponse__Output } from "../../../../../grpc/rpc/ocr_service/MotionDetectionResponse";
import { RecognizeBytesRequest } from "../../../../../grpc/rpc/ocr_service/RecognizeBytesRequest";

type OcrEnginesName = 'MangaOCR' | 'AppleVision' | string;

export class PyOcrService {
    
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private ocrServiceClient: OCRServiceClient | null = null;
    private serviceProcess: ChildProcessWithoutNullStreams;
    private serverAddress: string;
    private binRoot: string;
    private serviceKeepAlive: NodeJS.Timeout;

    constructor() {
        this.binRoot = isDev
            ? join( BIN_DIR, `/${os.platform()}/py_ocr_service/service` )
            : join( process.resourcesPath, '/bin/py_ocr_service/service' );
    }

    connect( serviceAddress: string ) {
        
        if ( !serviceAddress )
            return;
    
        console.log("Initializing PyOcrService | Address: "+ serviceAddress );

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
            ocrEngine: OcrEnginesName;
            languageCode: string;
            boxes?: OcrItemBox[]
        }
    ): Promise< OcrResult | null > {

        const ok = await this.processStatusCheck();        
        if ( !ok ) return null;

        const requestInput: RecognizeBytesRequest = {
            id: input.id,
            image_bytes: input.image,
            ocr_engine: input.ocrEngine,
            boxes: input?.boxes || [],
            language_code: input.languageCode
        };

        this.status = OcrAdapterStatus.Processing;
        // console.time('PpOcrAdapter.recognize');        
        const clientResponse = await new Promise< RecognizeDefaultResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.RecognizeBytes( requestInput, ( error, response ) => {
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
            id: clientResponse.id,
            context_resolution: clientResponse.context_resolution,
            results: ocrItems,
        });

        return result;

    }

    async getSupportedLanguages( ocrEngineName: OcrEnginesName ): Promise< string[] > {

        const ok = await this.processStatusCheck();        
        if ( !ok ) return [];

        if ( !this.ocrServiceClient )
            return [];

        const requestInput: GetSupportedLanguagesRequest = {
            ocr_engine: ocrEngineName
        };

        const clientResponse = await new Promise< GetSupportedLanguagesResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.GetSupportedLanguages( requestInput, ( error, response ) => {
                if (error) {
                    this.restart( () => {} );
                    return reject(error);
                }
                resolve(response);
            })
        );

        if ( !clientResponse )
            return [];

        return clientResponse.language_codes;
    }

    async motionDetection( input: MotionDetectionRequest ): Promise<number> {

        const ok = await this.processStatusCheck();        
        if ( !ok ) return 0;

        const clientResponse = await new Promise< MotionDetectionResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.MotionDetection( input, ( error, response ) => {
                if (error) {
                    this.restart( () => {} );
                    return reject(error);
                }
                resolve(response);
            })
        );

        return clientResponse?.frame_diff_sum || 0;
    }
    

    startProcess( onInitialized?: ( input?: any ) => void ) {

        const platform = os.platform();

        let executableName = 'py_ocr_service.exe';

        if ( platform !== 'win32' )
            executableName = 'py_ocr_service';

        const executable = join( this.binRoot + `/${executableName}` );
        
        this.serviceProcess = spawn(
            executable,
            [],
            { cwd: this.binRoot }
        );

        // Handle stdout data
        this.serviceProcess.stdout.on('data', ( data: string ) => {

            console.log(`stdout: ${data.toString()}`);        

            if ( data.includes('[INFO-JSON]:') ) {

                const jsonData = JSON.parse( data.toString().split('[INFO-JSON]:')[1] );

                if ( 'server_address' in jsonData ) {
                    this.serverAddress = jsonData.server_address;
                    this.connect( jsonData.server_address );
                    this.keepAlive();
                    if ( onInitialized )
                        onInitialized();
                }
            }
            
        });

        this.serviceProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        // Handle process exit
        this.serviceProcess.on('close', (code) => {
            console.log(`${executableName} process exited with code ${code}`);

            if ( this.status != OcrAdapterStatus.Restarting )
                this.restart( () => {} );
        });

        process.on('exit', () => {
            // Ensure the child process is killed before exiting
            this.serviceProcess.kill('SIGTERM'); // You can use 'SIGINT' or 'SIGKILL' as well
        });
        
        process.on('SIGSEGV', ( error: Error ) => {
            console.error( error );
            this.serviceProcess.kill();
            process.exit(1);
        });
    }

    async processStatusCheck(): Promise< boolean > {
        
        let triesCounter = 0;

        while( this.status != OcrAdapterStatus.Enabled ) {

            // Waiting for 2 seconds
            await new Promise( (resolve) => setTimeout(resolve, 2000) );
            triesCounter++;

            console.log('PyOcrService.processStatusCheck | counter: '+ triesCounter);

            if ( triesCounter > 15 ) return false;
        }

        return true
    }

    async restart( callback: () => void ): Promise< void > {

        this.restartProcess();

        const ok = await this.processStatusCheck();
        callback();

        if ( !ok ) {
            console.log("PyOCR service failed to restarted");
            return;
        }

        console.log("PyOCR service restarted successfully");
    };

    private restartProcess() {
        this.status = OcrAdapterStatus.Restarting;
        this.serviceProcess.kill('SIGTERM');
        this.startProcess();
    }

    keepAlive = ( timeoutSeconds = 15 ) => {

        if ( timeoutSeconds < 15 )
            timeoutSeconds = 15;

        if ( this.serviceKeepAlive )
            clearInterval( this.serviceKeepAlive );

        this.serviceKeepAlive = setInterval( () => {

            const requestInput = {
                keep_alive: true,
                timeout_seconds: timeoutSeconds
            };

            this.ocrServiceClient?.KeepAlive( requestInput, ( error, response ) => {
                if ( error ) {
                    console.error( error );
                    this.restart( () => {} );
                }
            });

        }, ( timeoutSeconds - 10 ) * 1000 ); // Executes every 1000 milliseconds = 1 second

    }
}