import { BrowserWindow, IpcMainInvokeEvent, clipboard, globalShortcut, ipcMain } from "electron";
import { UiohookKey, uIOhook } from "uiohook-napi";
import { CaptureSource, ExternalWindow } from "../ocr_recognition/common/types";
import { TaskbarProperties } from "../../gyp_modules/window_management/window_manager";
import { AppService, entireScreenAutoCaptureSource } from "./app.service";
import sharp from "sharp";
import os from 'os';
import { screen } from 'electron';
import { SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import { OcrRecognitionController } from "../ocr_recognition/ocr_recognition.controller";
import { createDebuggingWindow } from "../util/debugging/debugging.util";
import { mainController } from "../main/main.index";
import { browserExtensionsController } from "../extensions/extensions.index";
import isDev from 'electron-is-dev';
import { initializeApp } from "../@core/infra/app_initialization";
import { overlayController } from "../overlay/overlay.index";
import { ocrRecognitionController } from "../ocr_recognition/ocr_recognition.index";
import { settingsController } from "../settings/settings.index";
import { appInfoController } from "../app_info/app_info.index";
import { profileController } from "../profile/profile.index";
import { dictionariesController } from "../dictionaries/dictionaries.index";
import { ocrTemplatesController } from "../ocr_templates/ocr_templates.index";

export class AppController {

    private appService: AppService;

    private mainWindow: BrowserWindow;
    private overlayWindow: BrowserWindow;
    
    private captureSourceDisplay: Electron.Display | undefined;        
    private userSelectedDisplayId: number | undefined;
    
    private captureSourceWindow: ExternalWindow | undefined;
    private userSelectedWindowId: number | undefined;

    private activeCaptureSource: CaptureSource;
    
    private taskbar: TaskbarProperties;

    private globalShortcutAccelerators: string[] = [];

    private showOverlayWindowWithoutFocus: boolean = false;


    constructor( input: {
        appService: AppService
    }) {

        this.appService = input.appService;

        uIOhook.start();
    }

    async init() {

        this.mainWindow = await mainController.init();
  
        await browserExtensionsController.init({
            mainWindow: this.mainWindow
        });

        if ( isDev )
            createDebuggingWindow();
  

        await initializeApp()
            .then( async () => {
            
                this.overlayWindow = await overlayController.init( this.mainWindow );
                browserExtensionsController.addBrowserWindow( this.overlayWindow );
                
                ocrRecognitionController.init({
                    mainWindow: this.mainWindow,
                    overlayWindow: this.overlayWindow
                });
                mainController.loadMainPage();
                settingsController.init( this.mainWindow );
                appInfoController.init( this.mainWindow );
                profileController.init( this.mainWindow );
                dictionariesController.init({
                    mainWindow: this.mainWindow,
                    overlayWindow: this.overlayWindow
                });
                ocrTemplatesController.init({
                    mainWindow: this.mainWindow
                });

                browserExtensionsController.addBrowserWindow( this.mainWindow );
            });


        const settings = await this.appService.getActiveSettingsPreset();
        if ( !settings ) return;

        this.showOverlayWindowWithoutFocus = Boolean( settings.overlay.behavior.show_window_without_focus );

        this.registerGlobalShortcuts( settings.toJson() );
        this.registersIpcHandlers();
        this.handleCaptureSourceSelection();

        this.taskbar = this.appService.getTaskbar();

        this.activeCaptureSource = entireScreenAutoCaptureSource;
    }

    registersIpcHandlers() {

        ipcMain.handle( 'settings_preset:update', async ( event: IpcMainInvokeEvent, message: SettingsPresetJson ) => {

            if ( !message )
                return;
        
            const { restartOcrAdapter } = await settingsController.updateSettingsPreset( message );
        
            uIOhook.removeAllListeners();

            this.applySettingsPreset( message );
            overlayController.applySettingsPreset( message );
            ocrRecognitionController.applySettingsPreset( message );
        
            return {
                restartOcrAdapter
            };
        });

        ipcMain.handle( 'app:get_capture_sources',
            async ( event: IpcMainInvokeEvent ): Promise< CaptureSource[] > => {

                const sources = await this.appService.getAllCaptureSources();
                return sources;
            }
        );

        ipcMain.handle( 'app:get_active_capture_source',
            async ( event: IpcMainInvokeEvent ): Promise< CaptureSource > => {
                return this.activeCaptureSource;
            }
        );

        ipcMain.handle( 'app:set_capture_source',
            async ( event: IpcMainInvokeEvent, message: CaptureSource ): Promise< void > => {

                const { type, displayId } = message;

                this.userSelectedDisplayId = type === 'screen' && displayId != -1  ? 
                    message.displayId :
                    undefined;

                if ( !message?.displayId )
                    this.userSelectedWindowId = Number( message.id.split(':')[1] );
                else
                    this.userSelectedWindowId = undefined;

                this.activeCaptureSource = message;

                this.mainWindow.webContents.send(
                    'app:active_capture_source',
                    this.activeCaptureSource
                ); 
            }
        );
    }

    async registerGlobalShortcuts( settingsPresetJson?: SettingsPresetJson ) {
        
        if ( !settingsPresetJson ) {
            
            const settingsPreset = await this.appService.getActiveSettingsPreset();

            settingsPresetJson = settingsPreset?.toJson();
        }

        if ( !settingsPresetJson )
            return;

        const overlayHotkeys = settingsPresetJson.overlay.hotkeys;

        this.unregisterGlobalShortcuts();

        globalShortcut.register( overlayHotkeys.ocr, async () => {

            this.overlayWindow?.webContents.send( 'user_command:clear_overlay' );
            this.handleOcrCommand();
            // await this.ocrRecognitionController.recognize();
        });
        this.globalShortcutAccelerators.push( overlayHotkeys.ocr );
        
        
        if ( overlayHotkeys.ocr_on_screen_shot ) {
            uIOhook.on( 'keyup', async ( e ) => {

                if ( e.keycode !== UiohookKey.PrintScreen ) return;
                
                                        
                const runFullScreenImageCheck = e.altKey && !this.taskbar.auto_hide;

                // console.log({ runFullScreenImageCheck });
                // console.log({ userPreferredDisplayId: this.userPreferredDisplayId });
                // console.log({ captureSourceDisplay: this.captureSourceDisplay });

                const multipleDisplays = screen.getAllDisplays().length > 1;
                const isWindowImage = Boolean(e.altKey);

                if ( multipleDisplays ) {

                    if ( !isWindowImage )
                        return this.handleOcrCommand();
                        // return this.ocrRecognitionController.recognize();
                    
                    if ( isWindowImage && this.userSelectedWindowId )
                        return this.handleOcrCommand( clipboard.readImage().toPNG() );
                        // return this.ocrRecognitionController.recognize( clipboard.readImage().toPNG() );

                    else
                        return this.handleOcrCommand( clipboard.readImage().toPNG(), runFullScreenImageCheck );
                        // return this.ocrRecognitionController.recognize( clipboard.readImage().toPNG(), runFullScreenImageCheck );
                }
                else {

                    if ( this.userSelectedWindowId )
                        return this.handleOcrCommand( clipboard.readImage().toPNG() );
                        // return this.ocrRecognitionController.recognize( clipboard.readImage().toPNG() );

                    return this.handleOcrCommand( clipboard.readImage().toPNG(), runFullScreenImageCheck );
                    // return this.ocrRecognitionController.recognize( clipboard.readImage().toPNG(), runFullScreenImageCheck );
                }
                
            });
        }
    }

    private unregisterGlobalShortcuts() {

        this.globalShortcutAccelerators.forEach( accelerator => {
            globalShortcut.unregister( accelerator );
        });

        this.globalShortcutAccelerators = [];
    }

    private showOverlayWindow() {

        if ( this.showOverlayWindowWithoutFocus )
            this.overlayWindow.showInactive();
        else
            this.overlayWindow.show();
    }

    async applySettingsPreset( settingsPresetJson?: SettingsPresetJson ) {

        if ( !settingsPresetJson ) {
            settingsPresetJson = ( await this.appService.getActiveSettingsPreset() )
                ?.toJson();
        }

        if ( !settingsPresetJson )
            return;

        this.showOverlayWindowWithoutFocus = Boolean( settingsPresetJson.overlay.behavior.show_window_without_focus );

        this.registerGlobalShortcuts( settingsPresetJson );
    }

    setOverlayBounds( entireScreenMode: 'fullscreen' | 'maximized' = 'fullscreen' ) {
        // console.time("setOverlayBounds");        
        
        if ( this.captureSourceDisplay ) {            
            
            this.overlayWindow.setBounds({                
                ...this.captureSourceDisplay?.workArea,
            });
            
            if ( entireScreenMode === 'fullscreen' )
                this.overlayWindow.setFullScreen( entireScreenMode === 'fullscreen' );

            if ( entireScreenMode === 'maximized' )
                this.overlayWindow.maximize();
        }

        else if ( this.captureSourceWindow ) {

            let targetWindowBounds = {
                width: this.captureSourceWindow.size.width,
                height: this.captureSourceWindow.size.height,
                x: this.captureSourceWindow.position.x,
                y: this.captureSourceWindow.position.y,
            };

            if ( os.platform() === 'linux' )
                this.overlayWindow.setFullScreen( false );

            if ( os.platform() === 'win32' ) {
                // Handling potential issues with DIP
                targetWindowBounds = screen.screenToDipRect( this.overlayWindow, targetWindowBounds );
            }

            this.overlayWindow.setBounds( targetWindowBounds );

            // console.log({ targetWindowBounds });

            // Might be necessary to calculate and set twice
            // dipRect = screen.screenToDipRect( this.overlayWindow, targetWindowBounds )
            // this.overlayWindow.setBounds( dipRect );
        }

        // console.timeEnd("setOverlayBounds");
    }


    handleDisplaySource() {

        if ( this.userSelectedDisplayId !== undefined ) {
            this.captureSourceDisplay = this.appService.getDisplay( this.userSelectedDisplayId );
            return;
        }

        if ( 
            this.userSelectedDisplayId === undefined &&
            !this.userSelectedWindowId
        ) 
            this.captureSourceDisplay = this.appService.getCurrentDisplay();
        else 
            this.captureSourceDisplay = undefined;        
    }

    async handleWindowSource() {      
        
        if ( this.userSelectedWindowId )
            this.captureSourceWindow = await this.appService.getExternalWindow( this?.userSelectedWindowId );

        else 
            this.captureSourceWindow = undefined;

        // console.log( this.captureSourceWindow );
    }

    async handleCaptureSourceSelection() {
        // console.time('handleCaptureSourceSelection');
        this.handleDisplaySource();
        await this.handleWindowSource();
        // console.timeEnd('handleCaptureSourceSelection');
    }

    private async isFullScreenImage( imageBuffer: Buffer ): Promise<boolean> {

        const metadata = await sharp(imageBuffer).metadata();

        if ( 
            !this.captureSourceDisplay ||
            !metadata?.width ||
            !metadata?.height
         )
            return false;        

        if ( 
            metadata.width >= this.captureSourceDisplay?.size.width &&
            metadata.height >= this.captureSourceDisplay?.size.height
        ) {
            return true;
        }

        return false
    }

    private async handleOcrCommand( entireScreenImage?: Buffer, runFullScreenImageCheck?: boolean ) {

        console.log('AppController.handleOcrCommand');

        await this.handleCaptureSourceSelection();

        entireScreenImage = await this.appService.getCaptureSourceImage({
            image: entireScreenImage,
            display: this.captureSourceDisplay,
            window: this.captureSourceWindow,
        });

        if ( !entireScreenImage ) return;

        ocrRecognitionController.recognize( entireScreenImage );

        let isFullScreenImage = true;

        if ( entireScreenImage && runFullScreenImageCheck)
            isFullScreenImage = await this.isFullScreenImage(entireScreenImage);

        this.setOverlayBounds( isFullScreenImage ? 'fullscreen' :  'maximized' );
        this.showOverlayWindow();
    }
}