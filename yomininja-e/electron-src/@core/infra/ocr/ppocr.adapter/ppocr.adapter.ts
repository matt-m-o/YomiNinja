import { OcrItem, OcrResult } from "../../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import * as grpc from '@grpc/grpc-js';
import { OCRServiceClient } from "../../../../../grpc/rpc/ocr_service/OCRService";
import { RecognizeDefaultResponse__Output } from "../../../../../grpc/rpc/ocr_service/RecognizeDefaultResponse";
import { GetSupportedLanguagesResponse__Output } from "../../../../../grpc/rpc/ocr_service/GetSupportedLanguagesResponse";
import { ocrServiceProto } from "../../../../../grpc/grpc_protos";
import { RecognizeBytesRequest } from "../../../../../grpc/rpc/ocr_service/RecognizeBytesRequest";
import { join } from "path";
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { dialog } from 'electron';
import isDev from 'electron-is-dev';
import { BIN_DIR } from "../../../../util/directories.util";
import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";
import { UpdateSettingsPresetResponse__Output } from "../../../../../grpc/rpc/ocr_service/UpdateSettingsPresetResponse";
import { applyCpuHotfix } from "./hotfix/hardware_compatibility_hotfix";
import os from 'os';
import { PpOcrEngineSettings, getPpOcrDefaultSettings, ppOcrAdapterName } from "./ppocr_settings";
import { UpdatePpOcrSettingsRequest } from "../../../../../grpc/rpc/ocr_service/UpdatePpOcrSettingsRequest";

export class PpOcrAdapter implements OcrAdapter< PpOcrEngineSettings > {
    
    static _name: string = ppOcrAdapterName;
    public readonly name: string = PpOcrAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private ocrServiceClient: OCRServiceClient | null = null;
    private idCounter: number = 0;
    private ppocrServiceProcess: ChildProcessWithoutNullStreams;
    private recognitionCallOnHold: OcrRecognitionInput | undefined;


    initialize( serviceAddress?: string ) {

        
        if ( !serviceAddress )
            return;
    
        console.log("initializing wih address: "+ serviceAddress );

        this.ocrServiceClient = new ocrServiceProto.ocr_service.OCRService(
            serviceAddress,
            grpc.credentials.createInsecure(),
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
        
        this.idCounter++;
        
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

        console.log(clientResponse?.results[0]);
        console.log(clientResponse?.results[1]);
        
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
        
        const ocrItems: OcrItem[] = clientResponse.results.map( ( item ) => {
            return {
                ...item,
                text: [{
                    content: item.text
                }],
            } as OcrItem
        });

        return OcrResult.create({
            id: parseInt(clientResponse.id),
            context_resolution: clientResponse.context_resolution,
            results: ocrItems,
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

    startProcess( onInitialized?: ( input?: any ) => void ) {

        const platform = os.platform();

        const cwd = isDev
            ? join( BIN_DIR, `/${platform}/ppocr` )
            : join( process.resourcesPath, '/bin/ppocr/' );

        const executableName = platform === 'win32'
            ? 'ppocr_infer_service_grpc.exe'
            : 'start.sh'; // start.sh | ppocr_infer_service_grpc

        const executable = join( cwd + `/${executableName}` );
        
        this.ppocrServiceProcess = spawn(
            executable,
            [/*arguments */],
            { cwd }
        );

        // Handle stdout and stderr data
        this.ppocrServiceProcess.stdout.on('data', ( data: string ) => {

            if ( data.includes('[INFO-JSON]:') ) {

                const jsonData = JSON.parse( data.toString().split('[INFO-JSON]:')[1] );

                if ( 'server_address' in jsonData ) {
                    this.initialize( jsonData.server_address );
                    if ( onInitialized )
                        onInitialized();
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

            // Waiting for 2 seconds
            await new Promise( (resolve) => setTimeout(resolve, 2000) );
            triesCounter++;

            console.log('ppocrServiceProcessStatusCheck: '+ triesCounter);

            if ( triesCounter > 15 ) return false;
        }

        return true
    }

    async updateSettings(
        settingsUpdate: PpOcrEngineSettings,
        oldSettings?: PpOcrEngineSettings
    ): Promise< UpdateOcrAdapterSettingsOutput< PpOcrEngineSettings > > {

        let restart = false;

        if (
            !oldSettings ||
            oldSettings?.cpu_threads != settingsUpdate.cpu_threads ||
            oldSettings?.max_image_width != settingsUpdate.max_image_width ||
            oldSettings?.inference_runtime != settingsUpdate.inference_runtime
        )
            restart = true;

        settingsUpdate = {
            ...settingsUpdate,
            max_image_width: this.maxImageWidthValidation( settingsUpdate.max_image_width )
        };

        const requestInput: UpdatePpOcrSettingsRequest = {
            ...settingsUpdate,
        };

        const ok = await this.ppocrServiceProcessStatusCheck();

        if ( !ok ) return { settings: settingsUpdate, restart: false };
        
        let clientResponse: UpdateSettingsPresetResponse__Output | undefined;
        try {
            clientResponse = await new Promise< UpdateSettingsPresetResponse__Output | undefined >(
                (resolve, reject) => this.ocrServiceClient?.UpdatePpOcrSettings( requestInput, ( error, response ) => {
                    if (error) {
                        return reject(error)
                    }
                    resolve(response);
                })
            );
        } catch (error) {
            console.error( error );
            console.log("retrying: PpOcrAdapter.updateSettings");
            return await this.updateSettings( settingsUpdate, oldSettings );
        }
        
        return {
            settings: settingsUpdate,
            restart,
        };
    }

    getDefaultSettings(): PpOcrEngineSettings {
        return getPpOcrDefaultSettings();
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
        callback();

        if ( !ok ) {
            console.log("PPOCR Adapter failed to restarted");
            return;
        }

        console.log("PPOCR Adapter restarted successfully");
    };

    private restartProcess() {
        this.status = OcrAdapterStatus.Restarting;
        this.ppocrServiceProcess.kill('SIGTERM');
        this.startProcess();
    }

    private maxImageWidthValidation( maxImageWidth?: number ) {        

        if ( 
            !maxImageWidth ||
            maxImageWidth % 32 != 0 || // Must be multiple of 32
            maxImageWidth < 0
        )
            return 1600;

        return maxImageWidth;
    }
}