import { BrowserWindow, globalShortcut, screen, desktopCapturer, clipboard, ipcMain, IpcMainInvokeEvent } from "electron";
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

export class OcrRecognitionController {
    
    private ocrRecognitionService: OcrRecognitionService;
    
    private mainWindow: BrowserWindow;
    private overlayWindow: BrowserWindow;


    constructor( input: {        
        ocrRecognitionService: OcrRecognitionService;        
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
    }

    async recognize( entireScreenImage: Buffer ) {
        // console.log('');
        // console.time('controller.recognize');

        try {
            // console.log(activeProfile);
            // console.log('OcrRecognitionController.recognize')

            const ocrResultScalable = await this.ocrRecognitionService.recognize({
                imageBuffer: entireScreenImage,
                profileId: getActiveProfile().id
            });
            // console.log({ ocrResultScalable });

            // console.timeEnd('controller.recognize');
            // console.log('');

            // console.log( ocrResultScalable );

            this.overlayWindow.webContents.send( 'ocr:result', ocrResultScalable );

        } catch (error) {
            console.error( error );
        }
    }

    async applySettingsPreset( settingsPresetJson?: SettingsPresetJson ) {

        if ( !settingsPresetJson ) {
            settingsPresetJson = ( await this.ocrRecognitionService.getActiveSettingsPreset() )
                ?.toJson();
        }

        if ( !settingsPresetJson )
            return;
    }

    restartEngine() {

        // Adding a time gap to make sure it has enough time to complete anything it might be doing
        setTimeout( () => {
            this.ocrRecognitionService.restartOcrAdapter( () => {

                if ( !this.mainWindow ) return;

                this.mainWindow.webContents.send( 'ocr_recognition:ocr_engine_restarted' );
            });
        }, 3000 );
    }

}