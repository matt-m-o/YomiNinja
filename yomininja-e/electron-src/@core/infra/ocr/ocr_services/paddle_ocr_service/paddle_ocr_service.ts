import { OcrItem, OcrItemBox, OcrResult, OcrTextLine } from "../../../../domain/ocr_result/ocr_result";
import { OcrAdapterStatus, UpdateOcrAdapterSettingsOutput } from "../../../../application/adapters/ocr.adapter";
import * as grpc from '@grpc/grpc-js';
import { OCRServiceClient } from "../../../../../../grpc/rpc/ocr_service/OCRService";
import { RecognizeDefaultResponse__Output } from "../../../../../../grpc/rpc/ocr_service/RecognizeDefaultResponse";
import { GetSupportedLanguagesResponse__Output } from "../../../../../../grpc/rpc/ocr_service/GetSupportedLanguagesResponse";
import { ocrServiceProto } from "../../../../../../grpc/grpc_protos";
import { RecognizeBytesRequest } from "../../../../../../grpc/rpc/ocr_service/RecognizeBytesRequest";
import { join } from "path";
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import isDev from 'electron-is-dev';
import { BIN_DIR, USER_DATA_DIR } from "../../../../../util/directories.util";
import os from 'os';
import { UpdatePpOcrSettingsRequest } from "../../../../../../grpc/rpc/ocr_service/UpdatePpOcrSettingsRequest";
import { OcrEngineSettingsU } from "../../../types/entity_instance.types";
import fs from 'fs';
import { PpOcrEngineSettings } from "../../ppocr.adapter/ppocr_settings";
import { UpdateSettingsResponse__Output } from "../../../../../../grpc/rpc/ocr_service/UpdateSettingsResponse";
import { DetectRequest } from "../../../../../../grpc/rpc/ocr_service/DetectRequest";
import { DetectResponse__Output } from "../../../../../../grpc/rpc/ocr_service/DetectResponse";
import { getNextPortAvailable } from "../../../util/port_check";
import { TextLine__Output } from "../../../../../../grpc/rpc/ocr_service/TextLine";

export class PaddleOcrService {
    
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private ocrServiceClient: OCRServiceClient | null = null;
    private serviceProcess: ChildProcessWithoutNullStreams;
    private settingsPresetsRoot: string;
    private binRoot: string;

    private autoRestartCount = 0;

    constructor() {
        this.binRoot = isDev
            ? join( BIN_DIR, `/${os.platform()}/ppocr` )
            : join( process.resourcesPath, '/bin/ppocr/' );
    }

    connect( serviceAddress?: string ) {

        if ( !serviceAddress )
            return;
    
        console.log("initializing wih address: "+ serviceAddress );

        this.ocrServiceClient = new ocrServiceProto.ocr_service.OCRService(
            serviceAddress,
            grpc.credentials.createInsecure(),
        );

        this.status = OcrAdapterStatus.Enabled;
    }

    async recognize( input: RecognizeBytesRequest ): Promise< OcrResult | null > {
        
        const ok = await this.processStatusCheck();
        if ( !ok ) return null;

        this.status = OcrAdapterStatus.Processing;
        // console.time('PaddleOcrService.recognize');        
        const clientResponse = await new Promise< RecognizeDefaultResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.RecognizeBytes( input, ( error, response ) => {
                if (error) {
                    this.restart( () => {} );
                    return reject(error)
                }
                resolve(response);
            })
        ).catch( console.error );
        // console.timeEnd('PaddleOcrService.recognize');
        this.status = OcrAdapterStatus.Enabled;
        
        if ( !clientResponse )
            return null;
        
        if (
            !clientResponse?.context_resolution ||
            !clientResponse?.results
        )
            return null;
        
        const ocrItems: OcrItem[] = [];

        for ( const item of clientResponse.results ) {

            const lines: OcrTextLine[] = [];

            if ( !item?.text_lines?.length ) continue;
            
            for ( const line of item.text_lines ) {
                if ( !line?.content?.length ) continue;
                lines.push({
                    content: line.content,
                    box: line.box || undefined
                } as OcrTextLine );
            }

            ocrItems.push({
                ...item,
                text: lines,
                is_vertical: undefined // Not supported
            } as OcrItem);
        }

        const result = OcrResult.create({
            id: clientResponse.id,
            context_resolution: clientResponse.context_resolution,
            results: ocrItems,
        });


        return result
    }

    async detect( input: DetectRequest, id: string ): Promise< OcrItemBox[] > {

        const ok = await this.processStatusCheck();
        if ( !ok ) return [];

        const clientResponse = await new Promise< DetectResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.Detect( input, ( error, response ) => {
                if (error) {
                    return reject(error)
                }
                resolve(response);
            })
        );
            
        if ( !clientResponse ) return [];

        const results: OcrItemBox[] = clientResponse.results?.map( item => item.box )
            .filter( item => item !== null ) as OcrItemBox[];

        return results || [];
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

    async startProcess( onInitialized?: ( input?: any ) => void ) {

        this.handleSettingsPreset();

        const platform = os.platform();

        const executableName = platform === 'win32'
            ? 'ppocr_infer_service_grpc.exe' // !
            : 'start.sh'; // start.sh | ppocr_infer_service_grpc

        const executable = join( this.binRoot + `/${executableName}` );

        let port: string | number| undefined = (await getNextPortAvailable( 51_000 )) || 12345;

        this.status = OcrAdapterStatus.Starting;
        this.serviceProcess = spawn(
            executable,
            [ this.settingsPresetsRoot, 'default', port.toString() ],
            { cwd: this.binRoot }
        );
        this.serviceProcess.on('error', error => {
            console.error(error);
            if ( this.status === OcrAdapterStatus.Starting ) {
                this.status = OcrAdapterStatus.Disabled
                console.log("Warning: PaddleOCR service couldn't be started!")
            }
            if (onInitialized) onInitialized();
        });
        

        // Handle stdout and stderr data
        this.serviceProcess.stdout.on('data', ( data: string ) => {

            if ( data.includes('[INFO-JSON]:') ) {

                const jsonData = JSON.parse( data.toString().split('[INFO-JSON]:')[1] );

                if ( 'server_address' in jsonData ) {
                    this.connect( jsonData.server_address );
                    if ( onInitialized )
                        onInitialized();
                }
            }
            
            console.log(`stdout: ${data}`);        
        });

        this.serviceProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        // Handle process exit
        this.serviceProcess.on('close', (code) => {
            console.log(`ppocr_infer_service_grpc.exe process exited with code ${code}`);

            if ( 
                this.status != OcrAdapterStatus.Restarting &&
                this.status != OcrAdapterStatus.Disabled &&
                this.autoRestartCount < 5
            ) {
                this.restart( () => {} );
                this.autoRestartCount++;
            }

            if ( this.autoRestartCount >= 5 ) {
                this.status = OcrAdapterStatus.Disabled;
            }
        });

        process.on('exit', () => {
            // Ensure the child process is killed before exiting
            this.serviceProcess.kill('SIGTERM'); // You can use 'SIGINT' or 'SIGKILL' as well
        });
          
    }

    // Checks if the ppocrService is enabled.
    async processStatusCheck(): Promise< boolean > {

        if ( this.status === OcrAdapterStatus.Disabled )
            return false;
        
        let triesCounter = 0;

        while( this.status != OcrAdapterStatus.Enabled ) {

            // Waiting for 2 seconds
            await new Promise( (resolve) => setTimeout(resolve, 2000) );
            triesCounter++;

            console.log('ppocrServiceProcessStatusCheck: '+ triesCounter);

            if ( triesCounter > 5 )  {
                this.status = OcrAdapterStatus.Disabled;
                console.log('Warning: PaddleOCR service is not running!')
                return false;
            }
        }

        return true
    }

    async updateSettings(
        _settingsUpdate: OcrEngineSettingsU,
        _oldSettings?: OcrEngineSettingsU
    ): Promise< UpdateOcrAdapterSettingsOutput< PpOcrEngineSettings > > {

        let restart = false;

        let settingsUpdate = _settingsUpdate as PpOcrEngineSettings;
        let oldSettings = _oldSettings as PpOcrEngineSettings;

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

        const ok = await this.processStatusCheck();

        if ( !ok ) return { settings: settingsUpdate, restart: false };
        
        let clientResponse: UpdateSettingsResponse__Output | undefined;
        try {
            clientResponse = await new Promise< UpdateSettingsResponse__Output | undefined >(
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


    async restart( callback: () => void ): Promise< void > {

        this.restartProcess();

        const ok = await this.processStatusCheck();
        callback();

        if ( !ok ) {
            console.log("PaddleOCR service failed to restart!");
            return;
        }

        console.log("PaddleOCR service restarted successfully");
    };

    private restartProcess() {
        this.status = OcrAdapterStatus.Restarting;
        this.serviceProcess.kill('SIGTERM');
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

    handleSettingsPreset() {

        this.settingsPresetsRoot = join( USER_DATA_DIR, "/ppocr/presets/" );

        const dirExists = fs.existsSync( this.settingsPresetsRoot );
        const fileExists = fs.existsSync( this.settingsPresetsRoot + 'default.json' );

        if ( !dirExists )
            fs.mkdirSync( this.settingsPresetsRoot, { recursive: true } );
    
        // if ( !fileExists ) {
            const baseFilePath = join( this.binRoot, '/presets/default.json' );
            const dest = join( this.settingsPresetsRoot, 'default.json' );
            fs.copyFileSync(
                baseFilePath,
                dest
            );
        // }
    }

    handleLanguageTags( tag: string ) {
        
    }

    
}