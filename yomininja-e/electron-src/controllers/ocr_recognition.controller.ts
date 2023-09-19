import { BrowserWindow, globalShortcut, screen, desktopCapturer } from "electron";
import isDev from 'electron-is-dev';
import { join } from "path";
import { format } from 'url';
import { RecognizeImageUseCase } from '../../@core/application/use_cases/recognize_image/recognize_image.use_case';
import { PpOcrAdapter } from '../../@core/infra/ppocr.adapter/ppocr.adapter';
import { GetSupportedLanguagesOutput, GetSupportedLanguagesUseCase } from "../../@core/application/use_cases/get_supported_languages/get_supported_languages.use_case";

export class OcrRecognitionController {
        
    private presentationWindow: BrowserWindow | undefined;

    private recognizeImageUseCase: RecognizeImageUseCase;
    private getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;

    private selectedLanguageCode: string;    

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

        const imageBuffer = await this.takeScreenshot();
        
        try {
            const ocrResult = await this.recognizeImageUseCase.execute({
                ocrAdapterName: PpOcrAdapter._name,
                imageBuffer,
                languageCode: this.selectedLanguageCode,
            });            

            // console.log(ocrResult?.results);

            if ( !this.presentationWindow )
                this.createPresentationWindow();

            if ( !this.presentationWindow )
                return;

            this.presentationWindow.webContents.send( 'ocr:result', ocrResult );
            this.showPresentationWindow();
        } catch (error) {
            console.error( error );
        }

    }

    async getSupportedLanguages(): Promise< GetSupportedLanguagesOutput[] > {
        return await this.getSupportedLanguagesUseCase.execute();
    }

    registerGlobalShortcuts( window: BrowserWindow ) {

        globalShortcut.register( 'Alt+S', async () => {            

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
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                preload: join(__dirname, '../preload.js'),
            },
        });

        const url = isDev
        ? 'http://localhost:8000/ocr-overlay'
        : format({
            pathname: join(__dirname, '../../renderer/out/ocr-overlay.html'),
            protocol: 'file:',
            slashes: true,
        });

        this.presentationWindow.loadURL(url);
    }

    private showPresentationWindow() {

        if ( !this.presentationWindow )
            return;

        this.presentationWindow.show();
    }
}