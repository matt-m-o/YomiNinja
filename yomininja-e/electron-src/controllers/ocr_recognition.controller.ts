import { BrowserWindow, globalShortcut, screen, desktopCapturer, clipboard } from "electron";
import isDev from 'electron-is-dev';
import { join } from "path";
import { format } from 'url';
import { RecognizeImageUseCase } from '../@core/application/use_cases/recognize_image/recognize_image.use_case';
import { GetSupportedLanguagesOutput, GetSupportedLanguagesUseCase } from "../@core/application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { PAGES_DIR } from "../util/directories";
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { WindowManager } from '../../gyp_modules/window_management/window_manager';
import { SettingsPreset } from "../@core/domain/settings_preset/settings_preset";
import { get_SettingsPresetRepository } from "../@core/infra/container_registry/repositories_registry";


// ! Just for test
const settingsPreset = SettingsPreset.create();
get_SettingsPresetRepository().insert( settingsPreset );

export class OcrRecognitionController {
        
    private overlayWindow: BrowserWindow | undefined;

    private recognizeImageUseCase: RecognizeImageUseCase;
    private getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;

    private selectedLanguageCode: string;

    // private windowManager = new WindowManager();    

    constructor( input: {
        presentationWindow?: BrowserWindow;
        languageCode: string;
        recognizeImageUseCase: RecognizeImageUseCase;
        getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;
    }) {

        if ( input?.presentationWindow ) {
            this.overlayWindow = input.presentationWindow;
        }
        else {
            this.createOverlayWindow();
        }

        this.recognizeImageUseCase = input.recognizeImageUseCase;
        this.getSupportedLanguagesUseCase = input.getSupportedLanguagesUseCase;
        this.selectedLanguageCode = input.languageCode;

        if ( this.overlayWindow != null ) {
            this.registerGlobalShortcuts( this.overlayWindow );
        }
    }

    async fullScreenOcr( imageBuffer?: Buffer ) {
        console.log('');
        console.time('fullScreenOcr');

        if ( !imageBuffer )
            imageBuffer = await this.takeScreenshot();

        try {
            const ocrResultScalable = await this.recognizeImageUseCase.execute({                
                imageBuffer,
                settingsPresetId: settingsPreset.id,
            });

            // console.log(ocrResult?.results);

            if ( !this.overlayWindow )
                this.createOverlayWindow();

            if ( !this.overlayWindow )
                return;

            this.overlayWindow.webContents.send( 'ocr:result', ocrResultScalable );
            this.showOverlayWindow();

        } catch (error) {
            console.error( error );
        }
        console.timeEnd('fullScreenOcr');
        console.log('');
    }

    async getSupportedLanguages(): Promise< GetSupportedLanguagesOutput[] > {
        return await this.getSupportedLanguagesUseCase.execute();
    }

    registerGlobalShortcuts( window: BrowserWindow ) {

        // Electron full screen OCR
        globalShortcut.register( 'Alt+S', async () => {            

            window.webContents.send( 'user_command:clear_overlay' );
            await this.fullScreenOcr();            
        });
        
        // View overlay and copy text clipboard
        globalShortcut.register( 'Alt+C', () => {

            this.showOverlayWindow();
            window.webContents.send( 'user_command:copy_to_clipboard' );
        });

        // View overlay and clear
        globalShortcut.register( 'Alt+V', () => {

            this.showOverlayWindow();
            window.webContents.send( 'user_command:clear_overlay' );
        });

        uIOhook.start();
        uIOhook.on( 'keyup', async ( e ) => {  

            if (e.keycode === UiohookKey.PrintScreen) {                
                await this.fullScreenOcr( clipboard.readImage().toPNG() );                
            }  
        });
    }

    private async takeScreenshot(): Promise<Buffer> {

        console.time('takeScreenshot');

        // const { workAreaSize } = screen.getPrimaryDisplay();

        const sources = await desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize: {
                width: 1280, // workAreaSize.width, // 2560 // 1920
                height: 720, // workAreaSize.height, // 1440 // 1080
            }
        });

        console.timeEnd('takeScreenshot');

        return sources[0].thumbnail.toPNG();
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

        // this.overlayWindow.setAlwaysOnTop( true, "normal" ); // normal, pop-up-menu och screen-saver

        // Prevents black image when using youtube on some browsers (e.g. Brave)
        this.overlayWindow.setIgnoreMouseEvents( true, { // !showDevTools
            forward: !showDevTools,
        });
    }

    private showOverlayWindow() {

        if ( !this.overlayWindow )
            return;

        // this.windowManager.setForegroundWindow("OCR Overlay - YomiNinja");
        this.overlayWindow.setAlwaysOnTop( true, "normal" ); // normal, pop-up-menu och screen-saver
        this.overlayWindow.setAlwaysOnTop( false );
        this.overlayWindow.show();
    }


}