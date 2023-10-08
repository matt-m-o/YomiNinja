import { BrowserWindow, globalShortcut, screen, desktopCapturer, clipboard, ipcMain, IpcMainInvokeEvent } from "electron";
import isDev from 'electron-is-dev';
import { join } from "path";
import { format } from 'url';
import { PAGES_DIR } from "../util/directories";
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { activeProfile, getActiveProfile } from "../@core/infra/app_initialization";
import { OcrRecognitionService } from "./ocr_recognition.service";
import { SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import { CaptureSource, ExternalWindow } from "./common/types";
import { TaskbarProperties } from "../../gyp_modules/window_management/window_manager";
import sharp from "sharp";


const entireScreenAutoCaptureSource: CaptureSource = {
    id: '',
    name: 'Entire screen',
    displayId: -1
}

export class OcrRecognitionController {
    
    private ocrRecognitionService: OcrRecognitionService;
    
    private mainWindow: BrowserWindow | undefined;
    private overlayWindow: BrowserWindow | undefined;
    private overlayAlwaysOnTop: boolean = false;
    
    private captureSourceDisplay: Electron.Display | undefined;        
    private userPreferredDisplayId: number | undefined;
    
    private captureSourceWindow: ExternalWindow | undefined;
    private userPreferredWindowId: number | undefined;

    private activeCaptureSource: CaptureSource;
    
    private taskbar: TaskbarProperties;    

    constructor( input: {        
        ocrRecognitionService: OcrRecognitionService;        
    }) {
        this.ocrRecognitionService = input.ocrRecognitionService;
    }

    async init( mainWindow: BrowserWindow ) {
        
        uIOhook.start();

        this.mainWindow = mainWindow;

        const settings = await this.ocrRecognitionService.getActiveSettingsPreset();

        if (!settings) return;

        this.overlayAlwaysOnTop = Boolean(settings.overlay.behavior.always_on_top);

        this.createOverlayWindow();
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

                // console.log("Capture sources (displays): ")
                const displaysSources = sources.filter( source => source.displayId )                
                
                // If there are more than 1 display, the auto capture source option must be available
                if ( displaysSources.length > 1 )
                    sources.unshift( entireScreenAutoCaptureSource );

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

                this.userPreferredDisplayId = message?.displayId && message?.displayId > 0 ? 
                    message.displayId :
                    undefined;                

                if ( !message?.displayId )
                    this.userPreferredWindowId = Number( message.id.split(':')[1] );
                else
                    this.userPreferredWindowId = undefined;

                this.activeCaptureSource = message;                
            }
        );
    }

    async recognize( entireScreenImage?: Buffer, runFullScreenImageCheck?: boolean ) {
        console.log('');
        // console.time('controller.recognize');

        try {
            // console.log(activeProfile);

            await this.handleCaptureSourceSelection();

            const ocrResultScalable = await this.ocrRecognitionService.recognize({
                imageBuffer: entireScreenImage,
                profileId: getActiveProfile().id,
                display: this.captureSourceDisplay,
                window: this.captureSourceWindow,
            });

            if ( !this.overlayWindow )
                this.createOverlayWindow();

            // console.timeEnd('controller.recognize');

            if ( !this.overlayWindow )
                return;

            this.overlayWindow.webContents.send( 'ocr:result', ocrResultScalable );            

            let isFullScreenImage = true;

            if ( entireScreenImage && runFullScreenImageCheck)
                isFullScreenImage = await this.isFullScreenImage(entireScreenImage);             

            this.setOverlayBounds( isFullScreenImage ? 'fullscreen' :  'maximized' );
            this.showOverlayWindow();

        } catch (error) {
            console.error( error );
        }
        console.log('');
    }

    async registerGlobalShortcuts( settingsPresetJson?: SettingsPresetJson ) {

        if ( !this.overlayWindow )
            return;

        if ( !settingsPresetJson ) {
            
            const settingsPreset = await this.ocrRecognitionService.getActiveSettingsPreset();

            settingsPresetJson = settingsPreset?.toJson();
        }

        if ( !settingsPresetJson )
            return;

        const overlayHotkeys = settingsPresetJson.overlay.hotkeys;

        globalShortcut.unregisterAll();

        // Electron full screen OCR
        globalShortcut.register( overlayHotkeys.ocr, async () => {            

            this.overlayWindow?.webContents.send( 'user_command:clear_overlay' );
            await this.recognize();            
        });
        
        // View overlay and copy text clipboard
        globalShortcut.register( overlayHotkeys.show, () => {

            this.showOverlayWindow();
            this.overlayWindow?.webContents.send( 'user_command:copy_to_clipboard' );
        });

        // View overlay and clear
        globalShortcut.register( overlayHotkeys.show_and_clear, () => {

            this.showOverlayWindow();
            this.overlayWindow?.webContents.send( 'user_command:clear_overlay' );
        });
                
        
        uIOhook.removeAllListeners();

        if ( overlayHotkeys.ocr_on_screen_shot ) {
            uIOhook.on( 'keyup', async ( e ) => {  

                if (e.keycode === UiohookKey.PrintScreen) {
                                        
                    const runFullScreenImageCheck = e.altKey && !this.taskbar.auto_hide;

                    // console.log({ runFullScreenImageCheck });
                    // console.log({ userPreferredDisplayId: this.userPreferredDisplayId });
                    // console.log({ captureSourceDisplay: this.captureSourceDisplay });
                    
                    if (
                        this.userPreferredDisplayId ||
                        this.userPreferredWindowId ||
                        screen.getAllDisplays().length > 1 && !e.altKey // If the user didn't press the "Alt" key, the clipboard image will contain all displays causing problems
                    )
                        await this.recognize();

                    else
                        await this.recognize( clipboard.readImage().toPNG(), runFullScreenImageCheck );                                    
                }
                
            });
        }
    }

    private createOverlayWindow() {

        this.overlayWindow = new BrowserWindow({            
            // show: true,
            fullscreen: true,
            frame: false,
            transparent: true,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: false, // false
                contextIsolation: false,
                preload: join(__dirname, '../preload.js'),                
            },
        });

        this.overlayWindow.on( 'close', ( e ) => {
            e.preventDefault();
        });

        this.mainWindow?.on( 'closed', () => {
            this.overlayWindow?.destroy();
        });

        const url = isDev
        ? 'http://localhost:8000/ocr-overlay'
        : format({
            pathname: join( PAGES_DIR, '/ocr-overlay.html' ),
            protocol: 'file:',
            slashes: true,
        });

        this.overlayWindow.loadURL(url);
        // this.overlayWindow.maximize();        
        
        const showDevTools = isDev && false;
        if (showDevTools)
            this.overlayWindow.webContents.openDevTools();        

        
        this.overlayWindow.setAlwaysOnTop( this.overlayAlwaysOnTop && !showDevTools, "normal" ); // normal, pop-up-menu och screen-saver

        // Prevents black image when using youtube on some browsers (e.g. Brave)
        this.overlayWindow.setIgnoreMouseEvents( !showDevTools, { // !showDevTools
            forward: !showDevTools,
        });
    }

    private showOverlayWindow() {

        if ( !this.overlayWindow )
            return;

        // this.windowManager.setForegroundWindow("OCR Overlay - YomiNinja");
        this.overlayWindow.setAlwaysOnTop( true, "normal" ); // normal, pop-up-menu och screen-saver

        if ( !this.overlayAlwaysOnTop )
            this.overlayWindow.setAlwaysOnTop( false );        

        this.overlayWindow.show();
    }

    async refreshActiveSettingsPreset( settingsPresetJson?: SettingsPresetJson ) {

        if ( !settingsPresetJson ) {
            const settingsPreset = await this.ocrRecognitionService.getActiveSettingsPreset();
            settingsPresetJson = settingsPreset?.toJson();
        }

        if ( !settingsPresetJson )
            return;

        this.overlayAlwaysOnTop = Boolean( settingsPresetJson.overlay.behavior.always_on_top );
        this.overlayWindow?.setAlwaysOnTop( this.overlayAlwaysOnTop, "normal" );

        this.registerGlobalShortcuts( settingsPresetJson );

        this.overlayWindow?.webContents.send( 'settings_preset:active_data', settingsPresetJson );
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
        console.time("setOverlayBounds");

        if ( !this.overlayWindow ) return;
        
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

            const targetWindowBounds = {
                width: this.captureSourceWindow.size.width,
                height: this.captureSourceWindow.size.height,
                x: this.captureSourceWindow.position.x,
                y: this.captureSourceWindow.position.y,
            };

            // Handling potential issues with DIP
            let dipRect = screen.screenToDipRect( this.overlayWindow, targetWindowBounds );
            this.overlayWindow.setBounds( dipRect );

            // Might be necessary calculate and set twice
            // dipRect = screen.screenToDipRect( this.overlayWindow, targetWindowBounds )
            // this.overlayWindow.setBounds( dipRect );
        }

        console.timeEnd("setOverlayBounds");
    }


    handleDisplaySource() {

        if ( this.userPreferredDisplayId ) {
            this.captureSourceDisplay = this.ocrRecognitionService.getDisplay( this.userPreferredDisplayId );
            return;
        }

        if ( 
            !this.userPreferredDisplayId &&
            !this.userPreferredWindowId
        ) 
            this.captureSourceDisplay = this.ocrRecognitionService.getCurrentDisplay();
        else 
            this.captureSourceDisplay = undefined;

        // console.log({ display_id: this.captureSourceDisplay?.id })
    }

    async handleWindowSource() {      
        
        if ( this.userPreferredWindowId )
            this.captureSourceWindow = await this.ocrRecognitionService.getExternalWindow( this?.userPreferredWindowId );

        else 
            this.captureSourceWindow = undefined;
        
        // console.log(this.captureSourceWindow);
    }

    async handleCaptureSourceSelection() {
        console.time('handleCaptureSourceSelection');

        // console.log({
        //     userPreferredDisplayId: this.userPreferredDisplayId,
        //     userPreferredWindowId: this.userPreferredWindowId
        // });

        this.handleDisplaySource();
        await this.handleWindowSource();

        console.timeEnd('handleCaptureSourceSelection');
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