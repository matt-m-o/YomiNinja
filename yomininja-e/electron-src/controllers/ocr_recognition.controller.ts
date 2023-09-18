import { BrowserWindow, globalShortcut, screen, desktopCapturer } from "electron";
import isDev from 'electron-is-dev';
import { join } from "path";
import { format } from 'url';
import { RecognizeImageUseCase } from '../../@core/application/use_cases/recognize_image/recognize_image.use_case';
import { PpOcrAdapter } from '../../@core/infra/ppocr.adapter/ppocr.adapter';
import { GetSupportedLanguagesUseCase } from "../../@core/application/use_cases/get_supported_languages/get_supported_languages.use_case";

export class OcrRecognitionController {
        
    private presentationWindow: BrowserWindow | undefined;

    private recognizeImageUseCase: RecognizeImageUseCase;
    private getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;

    private selectedLanguageCode: string;
    private idCounter = 0;

    constructor( input: {        
        presentationWindow?: BrowserWindow;        
        languageCode: string;
        recognizeImageUseCase: RecognizeImageUseCase;
        getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;
    }) {        

        if ( input?.presentationWindow ) {
            this.presentationWindow = input.presentationWindow;
        }
        else {
            this.createPresentationWindow();
        }

        this.recognizeImageUseCase = input.recognizeImageUseCase;
        this.getSupportedLanguagesUseCase = input.getSupportedLanguagesUseCase;
        this.selectedLanguageCode = input.languageCode;

        if ( this.presentationWindow != null ) {
            this.registerGlobalShortcuts( this.presentationWindow );
        }
    }

    async fullScreenOcr() {

        this.idCounter++;

        const imageBuffer = await this.takeScreenshot();
        
        try {
            const ocrResult = await this.recognizeImageUseCase.execute({
                ocrAdapterName: PpOcrAdapter._name,
                imageBuffer,
                languageCode: this.selectedLanguageCode,
            });            

            console.log(ocrResult?.results);

        } catch (error) {
            console.error( error );
        }

    }

    async getSupportedLanguages() {
        await this.getSupportedLanguagesUseCase.execute();
    }

    registerGlobalShortcuts( window: BrowserWindow ) {

        console.log("registerGlobalShortcuts");

        globalShortcut.register( 'Alt+S', async () => {

            console.log("Alt+S");

            window.webContents.send( 'user_command:scan' );
            await this.fullScreenOcr();
            // this.showPresentationWindow();
        });
        
        globalShortcut.register( 'Alt+C', () => {
            this.showPresentationWindow();
            window.webContents.send( 'user_command:copy_to_clipboard' );
        });
    }

    private async takeScreenshot(): Promise<Buffer> {
        // const { workAreaSize } = screen.getPrimaryDisplay();

        const sources = await desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize: {
                width: 1280, // workAreaSize.width, // 2560 // 1920
                height: 720, // workAreaSize.height, // 1440 // 1080
            }
        });

        return sources[0].thumbnail.toPNG();        
    }

    private createPresentationWindow() {
        this.presentationWindow = new BrowserWindow({
            transparent: true, // !
            frame: false, // !
            // fullscreen: true, // !
            // alwaysOnTop: true, // !
            autoHideMenuBar: true,
            show: false,
            webPreferences: {
            //   preload: path.join(__dirname, 'preload.js'),
              nodeIntegration: true,
              contextIsolation: false,
            },
        });       
    }

    private showPresentationWindow() {

        if ( !this.presentationWindow )
            return;        

        this.presentationWindow.show();
    }
}