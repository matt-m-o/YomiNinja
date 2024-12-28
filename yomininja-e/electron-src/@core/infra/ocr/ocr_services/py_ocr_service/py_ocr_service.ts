import { OCRServiceClient } from "../../../../../../grpc/rpc/ocr_service/OCRService";
import { ChildProcessWithoutNullStreams, spawn, spawnSync } from 'child_process';
import { ocrServiceProto } from "../../../../../../grpc/grpc_protos";
import * as grpc from '@grpc/grpc-js';
import { HardwareAccelerationOption, OcrAdapterStatus } from "../../../../application/adapters/ocr.adapter";
import { OcrItem, OcrItemBox, OcrResult, OcrTextLine } from "../../../../domain/ocr_result/ocr_result";
import { RecognizeDefaultResponse__Output } from "../../../../../../grpc/rpc/ocr_service/RecognizeDefaultResponse";
import { RecognizeBase64Request } from "../../../../../../grpc/rpc/ocr_service/RecognizeBase64Request";
import os from 'os';
import path, { join } from "path";
import isDev from 'electron-is-dev';
import { BIN_DIR, USER_DATA_DIR } from "../../../../../util/directories.util";
import { GetSupportedLanguagesRequest } from "../../../../../../grpc/rpc/ocr_service/GetSupportedLanguagesRequest";
import { GetSupportedLanguagesResponse__Output } from "../../../../../../grpc/rpc/ocr_service/GetSupportedLanguagesResponse";
import { MotionDetectionRequest } from "../../../../../../grpc/rpc/ocr_service/MotionDetectionRequest";
import { MotionDetectionResponse__Output } from "../../../../../../grpc/rpc/ocr_service/MotionDetectionResponse";
import { RecognizeBytesRequest } from "../../../../../../grpc/rpc/ocr_service/RecognizeBytesRequest";
import { GetSupportedModelsRequest } from "../../../../../../grpc/rpc/ocr_service/GetSupportedModelsRequest";
import { GetSupportedModelsResponse } from "../../../../../../grpc/rpc/ocr_service/GetSupportedModelsResponse";

import { InstallModelRequest } from "../../../../../../grpc/rpc/ocr_service/InstallModelRequest";
import { InstallModelResponse } from "../../../../../../grpc/rpc/ocr_service/InstallModelResponse";
import { TextRecognitionModel } from "../../../../../../grpc/rpc/ocr_service/TextRecognitionModel"

import { GetHardwareAccelerationOptionsRequest } from "../../../../../../grpc/rpc/ocr_service/GetHardwareAccelerationOptionsRequest";
import { GetHardwareAccelerationOptionsResponse__Output } from "../../../../../../grpc/rpc/ocr_service/GetHardwareAccelerationOptionsResponse";
import { HardwareAccelerationOption as HardwareAccelerationOption_grpc } from "../../../../../../grpc/rpc/ocr_service/HardwareAccelerationOption"

import { getNextPortAvailable } from "../../../util/port_check";
import { sleep } from "../../../../../util/sleep.util";
import fs from "fs";

type OcrEnginesName = 'MangaOCR' | 'AppleVision' | string;

export class PyOcrService {
    
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private ocrServiceClient: OCRServiceClient | null = null;
    private serviceProcess: ChildProcessWithoutNullStreams;
    private serverAddress: string;
    private binRoot: string;
    private userBinRoot: string;
    private serviceKeepAlive: NodeJS.Timeout;
    private CUSTOM_MODULES_PATH: string;
    private MODELS_PATH: string;
    private pyExecutableName: string;

    constructor() {

        let arch = '';

        if ( process.platform === 'darwin' )
            arch = `/${process.arch}`;

        this.binRoot = isDev
            ? join( BIN_DIR, `/${os.platform()}${arch}/py_ocr_service` )
            : join( process.resourcesPath, '/bin/py_ocr_service' );

        this.pyExecutableName = os.platform() === 'win32' ? 'python.exe' : 'python';


        this.userBinRoot = join( USER_DATA_DIR, "/bin/py_ocr_service" )

        this.CUSTOM_MODULES_PATH = join( this.binRoot, "/python/Lib/site-packages" )

        this.MODELS_PATH = join( this.userBinRoot, '/models' );
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
        ).catch( console.error );
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
            const textLines: OcrTextLine[] = item.text_lines.map( text_line => {
                return {
                    content: text_line.content,
                    box: text_line.box || undefined
                } as OcrTextLine;
            });
            return {
                ...item,
                text: textLines,
            } as OcrItem;
        });

        const result = OcrResult.create({
            id: clientResponse.id,
            context_resolution: clientResponse.context_resolution,
            results: ocrItems,
            image: input.image
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

    async getSupportedModels( ocrEngineName: OcrEnginesName ): Promise< TextRecognitionModel[] > {

        const ok = await this.processStatusCheck();        
        if ( !ok ) return [];

        if ( !this.ocrServiceClient )
            return [];

        const requestInput: GetSupportedModelsRequest = {
            ocr_engine: ocrEngineName
        };

        const clientResponse = await new Promise< GetSupportedModelsResponse | undefined >(
            (resolve, reject) => this.ocrServiceClient?.GetSupportedModels( requestInput, ( error, response ) => {
                if (error) {
                    this.restart( () => {} );
                    return reject(error);
                }
                resolve(response);
            })
        );

        if ( !clientResponse?.models )
            return [];

        return clientResponse.models;
    }

    async installModel( ocrEngineName: OcrEnginesName, modelName: string ): Promise< InstallModelResponse > {

        let defaultResponse: InstallModelResponse = {
            success: false
        }

        const ok = await this.processStatusCheck();
        if ( !ok ) return defaultResponse;

        if ( !this.ocrServiceClient )
            return defaultResponse;

        const requestInput: InstallModelRequest = {
            ocr_engine: ocrEngineName,
            model_name: modelName
        };

        const clientResponse = await new Promise< InstallModelResponse | undefined >(
            (resolve, reject) => this.ocrServiceClient?.InstallModel( requestInput, ( error, response ) => {
                if (error) {
                    this.restart( () => {} );
                    return reject(error);
                }
                resolve(response);
            })
        );

        return clientResponse || defaultResponse;
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
    

    async startProcess( onInitialized?: ( input?: any ) => void ) {

        const platform = os.platform();

        let port: string | number| undefined = (await getNextPortAvailable( 53_000 )) || 32346;

        const executableName = this.pyExecutableName; // python or py_ocr_service

        const executablePath = join( this.userBinRoot + `/python/${this.pyExecutableName}` );
        const srcPath = join( this.binRoot + `/src` )
        const pyScript = join( this.binRoot + `/src/py_ocr_service.py` );

        // console.log({
        //     pythonExecutable: executablePath,
        //     srcPath,
        //     pyScript
        // });

        this.serviceProcess = spawn(
            executablePath,
            [ '-u', pyScript, port.toString() ],
            {
                cwd: srcPath,
                detached: platform === 'win32',
                //@ts-ignore
                env: {
                    CUSTOM_MODULES_PATH: this.CUSTOM_MODULES_PATH,
                    MODELS_PATH: this.MODELS_PATH,
                } 
            }
        );

        // Handle stdout data
        this.serviceProcess.stdout.on('data', async ( data: string ) => {

            console.log(`stdout: ${data.toString()}`);

            if ( data.includes('[INFO-JSON]:') ) {

                const jsonData = JSON.parse( data.toString().split('[INFO-JSON]:')[1] );

                if ( 'server_address' in jsonData ) {
                    this.serverAddress = jsonData.server_address;
                    await sleep( isDev ? 5000 : 2500 );
                    this.connect( jsonData.server_address );
                    // this.keepAlive();
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

            if ( this.status === OcrAdapterStatus.Disabled ) {
                return;
            }

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

        process.on( 'exit', this.killServiceProcess );
        process.on( 'SIGINT', this.killServiceProcess );
        process.on( 'SIGTERM', this.killServiceProcess );
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
        // this.killServiceProcess();
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

    killServiceProcess = () => {
        if (this.serviceProcess && this.serviceProcess.pid) {

            if (os.platform() == 'win32') {
                const { exec } = require('child_process');
                exec(`taskkill /PID ${this.serviceProcess.pid} /T /F`, (err: Error) => {
                    if (err) {
                        console.error('Failed to taskkill process:', err);
                    }
                });
                return
            }
            else {
                try {
                    process.kill(-this.serviceProcess.pid); // kill process group
                } catch (e) {
                    console.error('Failed to kill service process group:', e);
                }
            }
        }
    }

    killServiceProcess_deprecated = () => {        

        if ( !this.serviceProcess ) return;
        console.log(`Killing PyOCRService`);

        if ( !this.serviceProcess.pid ) return;

        try {
            this.serviceProcess.kill("SIGTERM");
            process.kill( -this.serviceProcess.pid );
        } catch (error) {
            console.error(error);
        }
    }

    private disable() {
        this.status = OcrAdapterStatus.Disabled;
        this.killServiceProcess();
    }
    private enable() {
        this.status = OcrAdapterStatus.Enabled;
        this.startProcess();
    }

    installPython() {

        const pyPath = join( this.binRoot, '/python' );
        const userPyPath = join( this.userBinRoot, '/python' );

        fs.mkdirSync( userPyPath, { recursive: true } )

        // Copy python files to user bin root
        const files = fs.readdirSync( pyPath, { withFileTypes: true } );
        for (const file of files) {
            if ( file.name !== 'Lib' ) {
                fs.cpSync(
                    join( pyPath, file.name ),
                    join( userPyPath, file.name ),
                    { recursive: true }
                )
            }
        }

        const pyExecutablePath = join( this.userBinRoot + `/python/${this.pyExecutableName}` );

        const getPip = spawnSync(
            pyExecutablePath,
            [ '-u', './get-pip.py' ],
            {
                cwd: path.dirname(pyExecutablePath),
            },
        );
        
        console.log("Installing python requirements...")
        const installRequirements = spawnSync(
            pyExecutablePath,
            '-u -m pip install -r ./requirements.txt'.split(' '),
            {
                cwd: path.dirname(pyExecutablePath),
                // detached: os.platform() === 'win32',
            },
        );
    }

    isPythonInstalled(): boolean {
        const userPyPath = join( this.userBinRoot, '/python' );
        return fs.existsSync( userPyPath );
    }

    installHardwareAcceleration(
        input: {
            option: HardwareAccelerationOption,
            callback?: (success: boolean, error?: Error) => void,
            logger?: ( logData: string ) => void
        }
    ) {
        const { option, callback, logger } = input;

        try {
            // this.killServiceProcess();
            // this.status = OcrAdapterStatus.Restarting;
            // this.serviceProcess.kill('SIGTERM');
            this.disable();

            const pyExecutablePath = join( this.userBinRoot + `/python/${this.pyExecutableName}` );

            const uninstallCmd = option.installCommand
                .split(' --index-url')[0]
                .replace('install', 'uninstall');
    
            const uninstallProcess = spawnSync(
                pyExecutablePath,
                [ '-u', '-m', ...uninstallCmd.split(' '), '-y'],
                {
                    cwd: path.dirname(pyExecutablePath),
                    // detached: os.platform() === 'win32',
                },
            );
            
            const installationProcess = spawn(
                pyExecutablePath,
                [ '-u', '-m', ...option.installCommand.split(' ') ],
                {
                    cwd: path.dirname(pyExecutablePath),
                    detached: os.platform() === 'win32',
                },
            );
    
            let ended = false;
    
            installationProcess.stdout.on( 'data', async ( data: string ) => {
                if ( logger )
                    logger( data.toString() );
            });
    
            installationProcess.on( 'error', async ( data ) => {
                console.log("installationProcess ERROR");
                if ( callback )
                    callback( false, data );
    
                ended = true;
                this.enable();
            });
    
            installationProcess.on( 'exit', async ( data ) => {
                console.log("installationProcess EXIT");
                if ( callback && !ended )
                    callback( true );
                
                ended = true;
                this.enable();
            });
        } catch (error) {
            console.error(error);
            this.enable();
        }
    }

    async getHardwareAccelerationOptions( ocrEngineName: string ): Promise< HardwareAccelerationOption[] > {

        const defaultResponse: HardwareAccelerationOption[] = [];

        const ok = await this.processStatusCheck();        
        if ( !ok ) return defaultResponse;

        if ( !this.ocrServiceClient )
            return defaultResponse;

        const requestInput: GetHardwareAccelerationOptionsRequest = {
            ocr_engine: ocrEngineName
        };

        const clientResponse = await new Promise< GetHardwareAccelerationOptionsResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.GetHardwareAccelerationOptions( requestInput, ( error, response ) => {
                if (error) {
                    this.restart( () => {} );
                    return reject(error);
                }
                resolve(response);
            })
        );

        if ( !clientResponse?.options )
            return defaultResponse;

        return clientResponse.options.map( opt => ({
            backend: opt.backend,
            computePlatform: opt.compute_platform,
            computePlatformVersion: opt.compute_platform_version || '',
            installed: Boolean(opt.installed),
            installCommand: opt.install_command,
            osPlatform: os.platform(),
        }));
    }
}