import { BrowserWindow, globalShortcut, screen, desktopCapturer, clipboard, IpcMainInvokeEvent } from "electron";
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

export class OcrRecognitionController {
    
    private ocrRecognitionService: OcrRecognitionService<OcrEngineSettingsU>;
    
    private mainWindow: BrowserWindow;
    private overlayWindow: BrowserWindow;
    private recognizing: boolean = false; 
    private result: OcrResultScalable | null = null;

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

        ipcMain.handle( 'ocr_recognition:get_result',
            ( event: IpcMainInvokeEvent ): OcrResultScalable | null => {
                return this.result;
            }
        );
    }

    async recognize(
        input: {
            image: Buffer,
            engineName?: string;
            autoOcr?: boolean;
        }
    ) {
        const { image, engineName, autoOcr } = input;
        
        this.recognizing = true;
        
        try {
            // console.log('');
            // console.time('controller.recognize');
            // console.log(activeProfile);
            // console.log('OcrRecognitionController.recognize')

            const ocrResultScalable = await this.ocrRecognitionService.recognize({
                imageBuffer: image,
                profileId: getActiveProfile().id,
                engineName,
                autoMode: input.autoOcr
            });
            // console.log({ ocrResultScalable });

            // console.timeEnd('controller.recognize');
            // console.log('');

            if (
                !autoOcr &&
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
            }

            let resultJson = ocrResultScalable;

            if ( ocrResultScalable ) {
                const overlayBounds = this.overlayWindow.getBounds();
                ocrResultScalable.position = {
                    top: overlayBounds.y,
                    left: overlayBounds.x
                };
                resultJson = await this.ocrResultToJson( ocrResultScalable );
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

                    this.mainWindow.webContents.send( 'ocr_recognition:ocr_engine_restarted' );
                }
            );
        }, 3000 );
    }

    isRecognizing(): boolean {
        return this.recognizing;
    }

    async ocrResultToJson( result: OcrResultScalable ): Promise<OcrResultScalable > {

        if ( result?.image && typeof result.image !== 'string' ) {
            result.image = await bufferToDataURL({
                image: result.image,
                format: 'png',
                quality: 100
            });
        }

        for ( const region of result.ocr_regions ) {
            if ( !region.image || !Buffer.isBuffer(region.image) )
                continue;
            region.image = await bufferToDataURL({
                image: region.image
            });
        }

        return result;
    }
}