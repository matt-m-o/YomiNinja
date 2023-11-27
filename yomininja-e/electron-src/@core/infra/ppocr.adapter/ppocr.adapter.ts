import { OcrItem, OcrResult } from "../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput } from "../../application/adapters/ocr.adapter";
import * as grpc from '@grpc/grpc-js';
import { OCRServiceClient } from "../../../../grpc/rpc/ocr_service/OCRService";
import { RecognizeDefaultResponse__Output } from "../../../../grpc/rpc/ocr_service/RecognizeDefaultResponse";
import { GetSupportedLanguagesResponse__Output } from "../../../../grpc/rpc/ocr_service/GetSupportedLanguagesResponse";
import { ocrServiceProto } from "../../../../grpc/grpc_protos";
import { RecognizeBytesRequest } from "../../../../grpc/rpc/ocr_service/RecognizeBytesRequest";
import { join } from "path";
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { dialog } from 'electron';
import isDev from 'electron-is-dev';
import { BIN_DIR } from "../../../util/directories.util";
import { OcrEngineSettings } from "../../domain/settings_preset/settings_preset";
import { UpdateSettingsPresetResponse__Output } from "../../../../grpc/rpc/ocr_service/UpdateSettingsPresetResponse";
import { UpdateSettingsPresetRequest } from "../../../../grpc/rpc/ocr_service/UpdateSettingsPresetRequest";
import { applyCpuHotfix } from "./hotfix/hardware_compatibility_hotfix";
import os from 'os';

export class PpOcrAdapter implements OcrAdapter {
    
    static _name: string = "PpOcrAdapter";
    public readonly name: string = PpOcrAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private ocrServiceClient: OCRServiceClient | null = null;
    private idCounter: number = 0;
    private ppocrServiceProcess: ChildProcessWithoutNullStreams;
    private recognitionCallOnHold: OcrRecognitionInput | undefined;

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
        
        if ( this.status === OcrAdapterStatus.Processing ) {
            this.recognitionCallOnHold = input;
            console.log('holding recognition input');
            return null;
        }
        else {
            this.recognitionCallOnHold = undefined;            
        }
        
        const ok = await this.ppocrServiceProcessStatusCheck();        
        if ( !ok ) return null;
        
        const requestInput: RecognizeBytesRequest = {
            id: this.idCounter.toString(),
            image_bytes: input.imageBuffer,
            language_code: input.languageCode            
        };        

        console.log('processing recognition input');
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
        
        // Throwing away current response an returning newest call result
        if ( this.recognitionCallOnHold ){
            return await this.recognize( this.recognitionCallOnHold );
        }

        if ( !clientResponse )
            return null;
        
        if (
            !clientResponse?.context_resolution ||
            !clientResponse?.results
        )
            return null;
        
        
        return OcrResult.create({
            id: parseInt(clientResponse.id),
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
                    this.restart( () => {} );
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

        const platform = os.platform();

        const cwd = isDev
            ? join( BIN_DIR, `/${platform}/ppocr` )
            : join( process.resourcesPath, '/bin/ppocr/' );

        const executableName = platform === 'win32'
            ? 'ppocr_infer_service_grpc.exe'
            : 'start.sh';
            
        const executable = join( cwd + `/${executableName}` );
        
        this.ppocrServiceProcess = spawn( executable, [/* command line arguments */], { cwd } );

        // Handle stdout and stderr data
        this.ppocrServiceProcess.stdout.on('data', ( data: string ) => {

            if ( data.includes('[INFO-JSON]:') ) {

                const jsonData = JSON.parse( data.toString().split('[INFO-JSON]:')[1] );

                const timeout = process.platform !== 'linux' ? 0 : 1000;

                if ( 'server_address' in jsonData ) {
                    setTimeout( () => {
                        this.initialize( jsonData.server_address );
                    }, timeout );
                }
            }
            
            console.log(`stdout: ${data}`);        
        });

        this.ppocrServiceProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        // Handle process exit
        this.ppocrServiceProcess.on('close', (code) => {
            console.log(`ppocr_infer_service_grpc.exe process exited with code ${code}`);

            if ( this.status != OcrAdapterStatus.Restarting )
                this.restart( () => {} );
        });

        process.on('exit', () => {
            // Ensure the child process is killed before exiting
            this.ppocrServiceProcess.kill('SIGTERM'); // You can use 'SIGINT' or 'SIGKILL' as well
        });
          
    }

    // Checks if the ppocrService is enabled.
    async ppocrServiceProcessStatusCheck(): Promise< boolean > {
        
        let triesCounter = 0;

        while( this.status != OcrAdapterStatus.Enabled ) {

            // Waiting for 1 second
            await new Promise( (resolve) => setTimeout(resolve, 2000) );
            triesCounter++;

            console.log('ppocrServiceProcessStatusCheck: '+ triesCounter);

            if ( triesCounter > 15 ) return false;
        }

        return true
    }

    async updateSettings( input: OcrEngineSettings ): Promise< boolean > {

        const requestInput: UpdateSettingsPresetRequest = {
            max_image_width: input.max_image_width,
            cpu_threads: input.cpu_threads,
            inference_runtime: input.inference_runtime
        };    
        
        const clientResponse = await new Promise< UpdateSettingsPresetResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.UpdateSettingsPreset( requestInput, ( error, response ) => {
                if (error) {
                    return reject(error)
                }
                resolve(response);
            })
        );        
        
        return Boolean( clientResponse?.success );
    }

    getDefaultSettings(): OcrEngineSettings {

        const defaultSettings: OcrEngineSettings = {
            image_scaling_factor: 1,
            max_image_width: 1600,
            cpu_threads: os.cpus().length,
            invert_colors: false,
            inference_runtime: 'Open_VINO'
        }
        
        const result = applyCpuHotfix( defaultSettings );

        return result.ocrEngineSettings;
    }

    getSettingsOptions(): OcrEngineSettingsOptions {
        return {
            inference_runtime: [
                {
                    value: 'Open_VINO',
                    displayName: 'OpenVINO CPU (fastest)'
                },
                {
                    value: 'ONNX_CPU',
                    displayName: 'ONNX CPU'
                }
            ]
        }
    }

    async restart( callback: () => void ): Promise< void > {

        this.restartProcess();

        const ok = await this.ppocrServiceProcessStatusCheck();

        if (!ok) return;

        console.log("PPOCR Adapter restarted successfully");

        callback();

    };

    private restartProcess() {
        this.status = OcrAdapterStatus.Restarting;
        this.ppocrServiceProcess.kill('SIGTERM');
        this.startProcess();
    }
}