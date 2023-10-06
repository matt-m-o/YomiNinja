import { BrowserWindow, globalShortcut, screen, desktopCapturer, clipboard, ipcMain, IpcMainInvokeEvent } from "electron";
import isDev from 'electron-is-dev';
import { join } from "path";
import { format } from 'url';
import { PAGES_DIR } from "../util/directories";
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { activeProfile, getActiveProfile } from "../@core/infra/app_initialization";
import { OcrRecognitionService } from "./ocr_recognition.service";
import { SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import { LanguageJson } from "../@core/domain/language/language";
import { CaptureSource, DisplayJson } from "./common/types";
export class OcrRecognitionController {
    
    private mainWindow: BrowserWindow | undefined;
    private overlayWindow: BrowserWindow | undefined;
    private overlayAlwaysOnTop: boolean = false;
    private autoDetectDisplay: boolean = true;
    private selectedDisplay: Electron.Display;
    // private windowManager = new WindowManager();
    private ocrRecognitionService: OcrRecognitionService;

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
        this.handleDisplayDetection();
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

                return await this.ocrRecognitionService.getAllCaptureSources();                    
            }
        );
    }

    async fullScreenOcr( imageBuffer?: Buffer ) {
        // console.log('');
        // console.time('fullScreenOcr');

        try {
            // console.log(activeProfile);

            this.handleDisplayDetection();

            const ocrResultScalable = await this.ocrRecognitionService.recognizeEntireScreen({
                imageBuffer,
                profileId: getActiveProfile().id,
                display: this.selectedDisplay
            });

            if ( !this.overlayWindow )
                this.createOverlayWindow();

            if ( !this.overlayWindow )
                return;

            this.overlayWindow.webContents.send( 'ocr:result', ocrResultScalable );
            this.showOverlayWindow();

        } catch (error) {
            console.error( error );
        }
        // console.timeEnd('fullScreenOcr');
        // console.log('');
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
            await this.fullScreenOcr();            
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
                    await this.fullScreenOcr( clipboard.readImage().toPNG() );                
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

        this.setOverlayDisplay();

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

    setOverlayDisplay() {
        console.time("setOverlayDisplay");

        if ( !this.overlayWindow ) return;        
        
        this.overlayWindow.setBounds( this.selectedDisplay.workArea );

        console.timeEnd("setOverlayDisplay");
    }

    handleDisplayDetection() {

        if ( this.autoDetectDisplay )
            this.selectedDisplay = this.ocrRecognitionService.getCurrentDisplay();
    }
    
}