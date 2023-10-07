import { desktopCapturer } from "electron";
import { WindowManager, WindowProperties } from "../../gyp_modules/window_management/window_manager";
import { GetSupportedLanguagesUseCase } from "../@core/application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { RecognizeImageUseCase } from "../@core/application/use_cases/recognize_image/recognize_image.use_case";
import { OcrResultScalable } from "../@core/domain/ocr_result_scalable/ocr_result_scalable";
import { GetActiveSettingsPresetUseCase } from "../@core/application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { getActiveProfile } from "../@core/infra/app_initialization";
import { OcrAdapter } from "../@core/application/adapters/ocr.adapter";
import { ChangeActiveOcrLanguageUseCase } from "../@core/application/use_cases/change_active_ocr_language/change_active_ocr_language.use_case";
import { Language } from "../@core/domain/language/language";
import { screen } from 'electron';
import { CaptureSource, ExternalWindow } from "./common/types";
import sharp from 'sharp';

export class OcrRecognitionService {

    private recognizeImageUseCase: RecognizeImageUseCase;
    private getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;
    private getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;    
    private ocrAdapter: OcrAdapter;

    private windowManager = new WindowManager();

    constructor(
        input: {
            recognizeImageUseCase: RecognizeImageUseCase;
            getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;
            getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;
            changeActiveOcrLanguageUseCase: ChangeActiveOcrLanguageUseCase;
            ocrAdapter: OcrAdapter;
        }
    ){
        this.recognizeImageUseCase = input.recognizeImageUseCase;
        this.getSupportedLanguagesUseCase = input.getSupportedLanguagesUseCase;
        this.getActiveSettingsPresetUseCase = input.getActiveSettingsPresetUseCase;        
        this.ocrAdapter = input.ocrAdapter;
    }

    async recognize( input: {
        imageBuffer?: Buffer,
        profileId: string,
        display?: Electron.Display,
        window?: ExternalWindow,
    }): Promise< OcrResultScalable | null > {

        let { imageBuffer, profileId, display, window } = input;

        if ( !imageBuffer ) {
            const { image } = await this.takeScreenshot({ display, window });
            imageBuffer = image;
        }
        else if (window) {
            // cropping image according to window properties
            imageBuffer = await sharp(imageBuffer).extract({
                    left: window.position.x,
                    top: window.position.y,
                    width: window.size.width,
                    height: window.size.height,
                })
                .toBuffer();
        }

        if ( !imageBuffer )
            return null;

        return await this.recognizeImageUseCase.execute({
            imageBuffer,
            profileId: profileId
        });
    }

    private async takeScreenshot( input: { display?: Electron.Display, window?: ExternalWindow }): Promise<{
        image?: Buffer,
        window?: ExternalWindow
    }> {

        const { display, window } = input;

        // console.time('takeScreenshot');

        // const { workAreaSize } = screen.getPrimaryDisplay();
        let sourceTypes: ( 'window' | 'screen' )[] = [];
        // sourceTypes.push('window'); // ! Just for testing        

        if ( display )
            sourceTypes.push('screen');
        else if (window)
            sourceTypes.push('window');

        const sources = await desktopCapturer.getSources({
            types: sourceTypes,
            thumbnailSize: {
                width: window?.size.width || display?.size.width || 1920, // workAreaSize.width, // 2560 // 1920 // 1280
                height: window?.size.height || display?.size.height || 1080, // workAreaSize.height, // 1440 // 1080 // 720
            },
        });
        
        let source: Electron.DesktopCapturerSource | undefined;

        if ( display ) {
            
            source = sources.find( source => source.display_id.includes( display.id.toString() ) );

            if ( !source )
                source = sources.find( source => source.name.includes( 'Entire screen' ) );
        }
        else if ( window ) {
            source = sources.find( source => source.id.includes( String(window.id) ) );
        }

        // sources.forEach( ({ id, display_id, name } ) => console.log({
        //     id, display_id, name
        // }));

        // console.timeEnd('takeScreenshot');

        if ( !source )
            return {};

        if ( display ) {
            
            return {
                image: source.thumbnail.toPNG()
            }
        }

        return {
            image: source.thumbnail.toPNG(),
            window
        }
    }

    async getActiveSettingsPreset() {
        return await this.getActiveSettingsPresetUseCase.execute({
            profileId: getActiveProfile().id
        });
    }

    restartOcrAdapter( callback:() => void ) {

        this.ocrAdapter.restart( callback );    
    }    

    async getSupportedLanguages( ): Promise<Language[]> {

        const results = await this.getSupportedLanguagesUseCase.execute();       

        return results.map( result => result.languages ).flat(1);
    }


    getDisplay( id: number ): Electron.Display | undefined {
        return screen.getAllDisplays()
            .find( display => display.id === id );
    }

    getCurrentDisplay(): Electron.Display {
        
        // screen.getAllDisplays().forEach( ({ id, label }, idx ) => console.log({
        //     idx, id, label
        // }));
            
        const { getCursorScreenPoint, getDisplayNearestPoint } = screen;
        
        return getDisplayNearestPoint( getCursorScreenPoint() );
    }

    getAllDisplays(): Electron.Display[] {
        return screen.getAllDisplays();
    }

    async getExternalWindow( id: number ): Promise<ExternalWindow | undefined> {

        const sources = await desktopCapturer.getSources({
            types: [ 'window' ],
            thumbnailSize: {
                width: 0,
                height: 0
            },
        });

        const windowCaptureSource = sources.find( source => source.id.includes( String(id) ) );

        if ( !windowCaptureSource ) return;
                
        const windowProps = this.windowManager.getWindow( Number( windowCaptureSource?.id.split(':')[1] ) );        

        const externalWindow: ExternalWindow = {
            id: Number(windowCaptureSource.id.split(':')[1]),
            name: windowCaptureSource.name,
            position: windowProps.position,
            size: windowProps.size
        };

        return externalWindow;
    }

    async getAllCaptureSources(): Promise< CaptureSource[] > {
        
        const sources = await desktopCapturer.getSources({
            types: [ 'screen', 'window' ],
            thumbnailSize: {
                width: 0,
                height: 0,
            },
        });

        return sources.map( source => ({
            id: source.id,
            displayId: Number(source.display_id),
            name: source.name
        }));
    }
}