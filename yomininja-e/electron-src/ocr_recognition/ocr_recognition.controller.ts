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
    
    private captureSourceDisplay: Electron.Display | undefined;        
    private userSelectedDisplayId: number | undefined;
    
    private captureSourceWindow: ExternalWindow | undefined;
    private userSelectedWindowId: number | undefined;

    private activeCaptureSource: CaptureSource;
    
    private taskbar: TaskbarProperties;

    private globalShortcutAccelerators: string[] = [];

    constructor( input: {        
        ocrRecognitionService: OcrRecognitionService;        
    }) {
        this.ocrRecognitionService = input.ocrRecognitionService;
    }

    async init( input: {
        mainWindow: BrowserWindow,
        overlayWindow: BrowserWindow,
    }) {
        
        uIOhook.start();

        this.mainWindow = input.mainWindow;
        this.overlayWindow = input.overlayWindow;

        const settings = await this.ocrRecognitionService.getActiveSettingsPreset();

        if (!settings) return;        
        
        this.registerGlobalShortcuts( settings.toJson() );
        this.registersIpcHandlers();        
        this.handleCaptureSourceSelection();

        this.taskbar = this.ocrRecognitionService.getTaskbar();

        this.activeCaptureSource = entireScreenAutoCaptureSource;
    }
    
    private registersIpcHandlers() {

        ipcMain.handle( 'ocr_recognition:get_supported_languages',
            async ( event: IpcMainInvokeEvent ) => {            

                return ( await this.ocrRecognitionService.getSupportedLanguages() )
                    .map( language => language.toJson() );                
            }
        );

        ipcMain.handle( 'ocr_recognition:get_capture_sources',
            async ( event: IpcMainInvokeEvent ): Promise< CaptureSource[] > => {

                const sources = await this.ocrRecognitionService.getAllCaptureSources();
                return sources;
            }
        );

        ipcMain.handle( 'ocr_recognition:get_active_capture_source',
            async ( event: IpcMainInvokeEvent ): Promise< CaptureSource > => {
                return this.activeCaptureSource;
            }
        );

        ipcMain.handle( 'ocr_recognition:set_capture_source',
            async ( event: IpcMainInvokeEvent, message: CaptureSource ): Promise< void > => {

                this.userSelectedDisplayId = message?.displayId && message?.displayId > 0 ? 
                    message.displayId :
                    undefined;                

                if ( !message?.displayId )
                    this.userSelectedWindowId = Number( message.id.split(':')[1] );
                else
                    this.userSelectedWindowId = undefined;

                this.activeCaptureSource = message;

                this.mainWindow.webContents.send(
                    'ocr_recognition:active_capture_source',
                    this.activeCaptureSource
                ); 
            }
        );
    }

    async recognize( entireScreenImage?: Buffer, runFullScreenImageCheck?: boolean ) {
        // console.log('');
        // console.time('controller.recognize');

        try {
            // console.log(activeProfile);
            // console.log('OcrRecognitionController.recognize')

            await this.handleCaptureSourceSelection();

            const ocrResultScalable = await this.ocrRecognitionService.recognize({
                imageBuffer: entireScreenImage,
                profileId: getActiveProfile().id,
                display: this.captureSourceDisplay,
                window: this.captureSourceWindow,
            });
            console.log({ ocrResultScalable });

            // console.timeEnd('controller.recognize');
            // console.log('');

            this.overlayWindow.webContents.send( 'ocr:result', ocrResultScalable );

            let isFullScreenImage = true;

            if ( entireScreenImage && runFullScreenImageCheck)
                isFullScreenImage = await this.isFullScreenImage(entireScreenImage);             

            this.setOverlayBounds( isFullScreenImage ? 'fullscreen' :  'maximized' );
            this.showOverlayWindow();

        } catch (error) {
            console.error( error );
        }
    }

    async registerGlobalShortcuts( settingsPresetJson?: SettingsPresetJson ) {
        
        if ( !settingsPresetJson ) {
            
            const settingsPreset = await this.ocrRecognitionService.getActiveSettingsPreset();

            settingsPresetJson = settingsPreset?.toJson();
        }

        if ( !settingsPresetJson )
            return;

        const overlayHotkeys = settingsPresetJson.overlay.hotkeys;

        this.unregisterGlobalShortcuts();

        // Electron full screen OCR
        globalShortcut.register( overlayHotkeys.ocr, async () => {            

            this.overlayWindow?.webContents.send( 'user_command:clear_overlay' );
            await this.recognize();            
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
                        return this.recognize();
                    
                    if ( isWindowImage && this.userSelectedWindowId )
                        return this.recognize( clipboard.readImage().toPNG() );

                    else
                        return this.recognize( clipboard.readImage().toPNG(), runFullScreenImageCheck );
                }
                else {

                    if ( this.userSelectedWindowId )
                        return this.recognize( clipboard.readImage().toPNG() );

                    return this.recognize( clipboard.readImage().toPNG(), runFullScreenImageCheck );
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
        this.overlayWindow.show();
    }

    async refreshActiveSettingsPreset( settingsPresetJson?: SettingsPresetJson ) {

        if ( !settingsPresetJson ) {
            settingsPresetJson = ( await this.ocrRecognitionService.getActiveSettingsPreset() )
                ?.toJson();
        }

        if ( !settingsPresetJson )
            return;        

        this.registerGlobalShortcuts( settingsPresetJson );        
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

    setOverlayBounds( entireScreenMode: 'fullscreen' | 'maximized' = 'fullscreen' ) {
        // console.time("setOverlayBounds");        
        
        if ( this.captureSourceDisplay ) {            
            
            this.overlayWindow.setBounds({                
                ...this.captureSourceDisplay?.workArea,
            });
            
            if ( entireScreenMode === 'fullscreen' )
                this.overlayWindow.setFullScreen( entireScreenMode === 'fullscreen' );

            if ( entireScreenMode === 'maximized')
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

            console.log({
                targetWindowBounds
            });

            // Might be necessary to calculate and set twice
            // dipRect = screen.screenToDipRect( this.overlayWindow, targetWindowBounds )
            // this.overlayWindow.setBounds( dipRect );
        }

        // console.timeEnd("setOverlayBounds");
    }


    handleDisplaySource() {

        if ( this.userSelectedDisplayId ) {
            this.captureSourceDisplay = this.ocrRecognitionService.getDisplay( this.userSelectedDisplayId );
            return;
        }

        if ( 
            !this.userSelectedDisplayId &&
            !this.userSelectedWindowId
        ) 
            this.captureSourceDisplay = this.ocrRecognitionService.getCurrentDisplay();
        else 
            this.captureSourceDisplay = undefined;        
    }

    async handleWindowSource() {      
        
        if ( this.userSelectedWindowId )
            this.captureSourceWindow = await this.ocrRecognitionService.getExternalWindow( this?.userSelectedWindowId );

        else 
            this.captureSourceWindow = undefined;            
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

}