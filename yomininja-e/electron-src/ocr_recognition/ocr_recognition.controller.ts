import { BrowserWindow, globalShortcut, screen, desktopCapturer, clipboard, IpcMainInvokeEvent, app } from "electron";
import isDev from 'electron-is-dev';
import { join } from "path";
import { format } from 'url';
import { PAGES_DIR } from "../util/directories.util";
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { activeProfile, getActiveProfile } from "../@core/infra/app_initialization";
import { OcrRecognitionService, entireScreenAutoCaptureSource } from "./ocr_recognition.service";
import { SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import { CaptureSource, ExternalWindow } from "./common/types";
import { TaskbarProperties } from "../../gyp_modules/window_management/window_manager";
import sharp from "sharp";
import os from 'os';
import { OcrEngineSettingsU } from "../@core/infra/types/entity_instance.types";
import { InAppNotification } from "../common/types/in_app_notification";
import { ipcMain } from "../common/ipc_main";
import { bufferToDataURL } from "../util/image.util";
import { OcrResultScalable } from "../@core/domain/ocr_result_scalable/ocr_result_scalable";
import { cloneDeep, find } from 'lodash';
import { Notification } from 'electron';
import { pushInAppNotification } from "../common/notification_helpers";
import { HardwareAccelerationOption } from "../@core/application/adapters/ocr.adapter";

export type Recognition_Output = {
    result: OcrResultScalable | null;
    status: 'complete' | 'replaced' | 'failed';
};

export class OcrRecognitionController {
    
    private ocrRecognitionService: OcrRecognitionService<OcrEngineSettingsU>;
    
    private mainWindow: BrowserWindow;
    private overlayWindow: BrowserWindow;
    private recognizing: boolean = false;
    private result: OcrResultScalable | null = null;
    private ocrRequestImageBuffer: Buffer | undefined;
    private recognitionCallOnHold: Recognition_Input | undefined;

    constructor( input: {        
        ocrRecognitionService: OcrRecognitionService< OcrEngineSettingsU >;        
    }) {
        this.ocrRecognitionService = input.ocrRecognitionService;
    }

    async init( input: {
        mainWindow: BrowserWindow,
        overlayWindow: BrowserWindow,
    }) {

        this.mainWindow = input.mainWindow;
        this.overlayWindow = input.overlayWindow;

        const settings = await this.ocrRecognitionService.getActiveSettingsPreset();

        if (!settings) return;
        
        this.registersIpcHandlers();
    }
    
    private registersIpcHandlers() {

        ipcMain.handle( 'ocr_recognition:get_supported_languages',
            async ( event: IpcMainInvokeEvent ) => {            

                return ( await this.ocrRecognitionService.getSupportedLanguages() )
                    .map( language => language.toJson() );                
            }
        );

        ipcMain.handle( 'ocr_recognition:get_supported_ocr_engines',
            ( event: IpcMainInvokeEvent ): { [key: string]: string; } => {
                return this.ocrRecognitionService.getSupportedOcrEngines();
            }
        );

        ipcMain.handle( 'ocr_recognition:get_hardware_acceleration_options',
            async (
                event: IpcMainInvokeEvent,
                engineName: string
            ): Promise< HardwareAccelerationOption[] > => {
                
                return await this.ocrRecognitionService.getHardwareAccelerationOptions( engineName );
            }
        );

        ipcMain.handle( 'ocr_recognition:install_hardware_acceleration',
            async (
                event: IpcMainInvokeEvent,
                engineName: string,
                option: HardwareAccelerationOption
            ): Promise< boolean > => {
                console.log(engineName)
                console.log(option);
                return await this.installHardwareAcceleration( engineName, option );
            }
        );

        ipcMain.handle( 'ocr_recognition:get_result',
            ( event: IpcMainInvokeEvent ): OcrResultScalable | null => {
                return this.result;
            }
        );
    }

    recognize = async ( input: Recognition_Input ): Promise< Recognition_Output > => {
        const { image, engineName } = input;
        
        if ( this.recognizing ) {
            this.recognitionCallOnHold = cloneDeep(input);
            console.log('Replacing current recognition request!');
            return {
                result: null,
                status: 'replaced'
            };
        }
        else {
            this.recognitionCallOnHold = undefined;            
        }
        
        const response: Recognition_Output = {
            result: null,
            status: 'failed'
        };
        
        this.recognizing = true;
        
        try {
            // console.log('');
            console.time('Recognition time');
            // console.log(activeProfile);
            // console.log('OcrRecognitionController.recognize')

            const ocrResultScalable = await this.ocrRecognitionService.recognize({
                imageBuffer: image,
                profileId: getActiveProfile().id,
                engineName,
                autoMode: false
            });
            this.recognizing = false;

            // Throwing away current response an returning newest call result
            if ( this.recognitionCallOnHold ){
                const newInput = cloneDeep( this.recognitionCallOnHold );
                this.recognitionCallOnHold = undefined;
                return await this.recognize( newInput );
            }

            response.result = ocrResultScalable;

            response.status = 'complete';

            // console.timeEnd('controller.recognize');
            // console.log('');
            if (
                ( !ocrResultScalable ||
                  !ocrResultScalable?.ocr_regions?.length ||
                  !ocrResultScalable?.ocr_regions?.some( region => region?.results?.length ) )
            ) {
                
                const notification: InAppNotification = {
                    type: 'info',
                    message: 'No text recognized! Please try again.',
                    autoHideDuration: 3000
                };

                ipcMain.send(
                    this.overlayWindow,
                    'notifications:show',
                    notification
                );

                response.status = 'failed';
            }

            let resultJson = ocrResultScalable;

            if ( ocrResultScalable ) {
                const overlayBounds = this.overlayWindow.getBounds();
                ocrResultScalable.position = {
                    top: overlayBounds.y,
                    left: overlayBounds.x
                };
                resultJson = await this.ocrResultToJson( ocrResultScalable );
                this.ocrRequestImageBuffer = image;
            }

            this.result = resultJson || null;

            ipcMain.send(
                this.overlayWindow,
                'ocr:result',
                this.result
            );

        } catch (error) {
            console.error( error );
        }
        
        this.recognizing = false;

        console.timeEnd('Recognition time');
        return response;
    }

    async autoRecognize(
        input: {
            image: Buffer,
            engineName?: string;
        }
    ) {
        const { image, engineName } = input;
        
        if ( this.recognizing ) return;
        
        try {
            // console.log('');
            // console.time('autoRecognize');
            // console.log(activeProfile);
            // console.log('OcrRecognitionController.recognize')

            const ocrResultScalable = await this.ocrRecognitionService.recognize({
                imageBuffer: image,
                profileId: getActiveProfile().id,
                engineName,
                autoMode: true
            });

            if ( this.result?.id === ocrResultScalable?.id ) {
                console.timeEnd('autoRecognize');
                return;
            }
            // console.log({ ocrResultScalable });

            // console.timeEnd('controller.recognize');
            // console.log('');

            let resultJson = ocrResultScalable;

            if ( ocrResultScalable ) {
                const overlayBounds = this.overlayWindow.getBounds();
                ocrResultScalable.position = {
                    top: overlayBounds.y,
                    left: overlayBounds.x
                };
                resultJson = await this.ocrResultToJson( ocrResultScalable );
                this.ocrRequestImageBuffer = image;
            }

            this.result = resultJson || null;

            ipcMain.send(
                this.overlayWindow,
                'ocr:result',
                this.result
            );

        } catch (error) {
            console.error( error );
        }

        // console.timeEnd('autoRecognize');
        // this.recognizing = false;
    }

    async applySettingsPreset( settingsPresetJson?: SettingsPresetJson ) {

        if ( !settingsPresetJson ) {
            settingsPresetJson = ( await this.ocrRecognitionService.getActiveSettingsPreset() )
                ?.toJson();
        }

        if ( !settingsPresetJson )
            return;
    }

    restartEngine( engineName: string ) {

        // Adding a time gap to make sure it has enough time to complete anything it might be doing
        setTimeout( () => {
            this.ocrRecognitionService.restartOcrAdapter(
                engineName,
                () => {

                    if ( !this.mainWindow ) return;

                    ipcMain.send( this.mainWindow, 'ocr_recognition:ocr_engine_restarted' );
                }
            );
        }, 3000 );
    }

    isRecognizing(): boolean {
        return this.recognizing;
    }

    async ocrResultToJson( result: OcrResultScalable ): Promise<OcrResultScalable > {

        if ( result?.image && typeof result.image !== 'string' ) {
            result.image = 'data:image/png;base64,'+Buffer.from(result.image).toString('base64');
        }

        // for ( const region of result.ocr_regions ) {
        //     if ( !region.image || !Buffer.isBuffer(region.image) )
        //         continue;
        //     region.image = await bufferToDataURL({
        //         image: region.image
        //     });
        // }

        return result;
    }

    resultImage(): Buffer | undefined {
        return this.ocrRequestImageBuffer;
    }

    async installOcrModels() {

        const ocrAdapters = [ 'MangaOcrAdapter' ];

        for ( const ocrAdapter of ocrAdapters ) {

            const models = await this.ocrRecognitionService.getSupportedModels(ocrAdapter);
        
            for ( const model of models ) {
                if ( !model.isInstalled && model.name ) {

                    console.log(`Installing OCR model: ${model.name}`);
                    this.notify({
                        type: 'info',
                        title: "Installing OCR model!",
                        message: `Model: ${model.name}`
                    });

                    const success = await this.ocrRecognitionService.installOcrModel( ocrAdapter, model.name );
                    
                    this.notify({
                        type: success ? 'info' :'error',
                        title: success ? "OCR model installed!" : "OCR model installation failed!",
                        message: `Model: ${model.name}`
                    });
                }
            }
        }
    }

    async installHardwareAcceleration( engineName: string, option: HardwareAccelerationOption ) {
        const optionName = `${option.backend} ${option.computePlatform} ${option.computePlatformVersion}`;
        console.log(`Installing: ${optionName}`);
        this.notify({
            type: 'info',
            title: `Installing runtime!`,
            message: `Runtime: ${optionName}`
        });
        const success = await this.ocrRecognitionService.installHardwareAcceleration( engineName, option );
        this.notify({ 
            type: success ? 'info' :'error',
            title: success ? "Runtime installed!" : "Runtime installation failed!",
            message: `Runtime: ${optionName}`
        });

        return success;
    }

    notify( input: {type: 'error' | 'info', title: string, message: string} ) {

        const { type, title, message } = input;

        pushInAppNotification({
            notification: {
                type,
                message: `${title}\n${message}`,
            },
            windows: [
                this.mainWindow,
                this.overlayWindow
            ]
        });

        (new Notification({
            title,
            body: message
        })).show()
    }
}

export type Recognition_Input = {
    image: Buffer;
    engineName?: string;
    autoOcr?: boolean;
};