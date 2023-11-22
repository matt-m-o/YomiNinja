import { desktopCapturer } from "electron";
import { TaskbarProperties, WindowManager, WindowProperties } from "../../gyp_modules/window_management/window_manager";
import { GetSupportedLanguagesUseCase } from "../@core/application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { RecognizeImageUseCase } from "../@core/application/use_cases/recognize_image/recognize_image.use_case";
import { OcrResultScalable } from "../@core/domain/ocr_result_scalable/ocr_result_scalable";
import { GetActiveSettingsPresetUseCase } from "../@core/application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { getActiveProfile, windowManager } from "../@core/infra/app_initialization";
import { OcrAdapter } from "../@core/application/adapters/ocr.adapter";
import { ChangeActiveOcrLanguageUseCase } from "../@core/application/use_cases/change_active_ocr_language/change_active_ocr_language.use_case";
import { Language } from "../@core/domain/language/language";
import { screen } from 'electron';
import { CaptureSource, ExternalWindow } from "./common/types";
import sharp from 'sharp';
import { displayImage } from "../util/debugging/debugging.util";


export const entireScreenAutoCaptureSource: CaptureSource = {
    id: '',
    name: 'Entire screen',
    displayId: -1
};

export class OcrRecognitionService {

    private recognizeImageUseCase: RecognizeImageUseCase;
    private getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;
    private getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;    
    private ocrAdapter: OcrAdapter;    

    constructor(
        input: {
            recognizeImageUseCase: RecognizeImageUseCase;
            getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;
            getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;            
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
        console.log('ocrRecognitionService.recognize');

        let { imageBuffer, profileId, display, window } = input;

        if ( !imageBuffer ) {
            const { image } = await this.takeScreenshot({ display, window });
            imageBuffer = image;
        }
        else if (window) {
            // cropping image according to window properties
            imageBuffer = await this.cropWindowFromImage( window, imageBuffer );
        }

        // displayImage( imageBuffer as Buffer );

        if ( !imageBuffer )
            return null;

        // const isValidImage = await this.isValidImage( imageBuffer );
        // console.log({ isValidImage });

        // if ( !isValidImage ) return null;

        return await this.recognizeImageUseCase.execute({
            imageBuffer,
            profileId: profileId
        });
    }

    private async takeScreenshot( input: { display?: Electron.Display, window?: ExternalWindow }): Promise<{
        image?: Buffer,
        window?: ExternalWindow
    }> {
        // console.time('takeScreenshot');        

        const { display, window } = input;

        let sourceTypes: ( 'window' | 'screen' )[] = [];          

        if ( display )
            sourceTypes.push('screen');
        else if ( window )
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
            const displayId = display.id.toString();
            source = sources.find( source => source.display_id.includes( displayId ) );

            if ( !source )
                source = sources.find( source => source.name.includes( 'Entire screen' ) );
        }
        else if ( window ) {
            const windowId = window.id.toString();
            source = sources.find( source => source.id.includes( windowId ) );
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
                
        const windowProps = await windowManager.getWindow( Number( windowCaptureSource?.id.split(':')[1] ) );
        if ( !windowProps ) return;

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

        const results: CaptureSource[] = sources.map( source => ({
            id: source.id,
            displayId: Number(source.display_id),
            name: source.name
        }));

        const displaysSources = sources.filter( source => source.display_id );
            
        // If there are more than 1 display, the auto capture source option must be available
        if ( displaysSources.length > 1 )
            results.unshift( entireScreenAutoCaptureSource );

        return results;
    }

    getTaskbar(): TaskbarProperties {

        return windowManager.getTaskbar();
    }

    async cropWindowFromImage( window: ExternalWindow, image: Buffer ): Promise<Buffer> {

        // console.log('cropping window from image')

        const metadata = await sharp(image).metadata();

        if (
            metadata.width == window.size.width &&            
            metadata.height == window.size.height
        )
            return image;

        return await sharp(image).extract({
                left: window.position.x,
                top: window.position.y,
                width: window.size.width,
                height: window.size.height,
            })
            .toBuffer();    
    }

    async isValidImage( data: Buffer | string ): Promise< boolean > {
        try {

            const metadata = await sharp(data).metadata();
            console.log({ metadata });

            return true;
        } catch (error) {
            return false;
        }
    }
}
