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

    async recognizeEntireScreen( input: {
        imageBuffer?: Buffer,
        profileId: string,
    }): Promise< OcrResultScalable | null > {

        let { imageBuffer, profileId } = input;

        if ( !imageBuffer ) {
            const { image } = await this.takeScreenshot( 'Entire screen' );
            imageBuffer = image;
        }

        if ( !imageBuffer )
            return null;

        return await this.recognizeImageUseCase.execute({
            imageBuffer,
            profileId: profileId
        });
    }

    private async takeScreenshot( target = 'Entire screen' ): Promise<{
        image?: Buffer,
        windowProps?: WindowProperties
    }> {

        console.time('takeScreenshot');

        // const { workAreaSize } = screen.getPrimaryDisplay();
        let sourceTypes: ( 'window' | 'screen' )[] = [];

        let windowProps: WindowProperties | undefined;

        if ( target === 'Entire screen' )
            sourceTypes.push('screen');
        else{
            sourceTypes.push('window');
            windowProps = this.windowManager.getWindowProperties( target );
        }

        const sources = await desktopCapturer.getSources({
            types: sourceTypes,
            thumbnailSize: {
                width: windowProps?.size.width || 1920, // workAreaSize.width, // 2560 // 1920 // 1280
                height: windowProps?.size.height || 1080, // workAreaSize.height, // 1440 // 1080 // 720
            },
        });
        
        const source = sources.find( source => source.name.includes( target ) );

        console.timeEnd('takeScreenshot');

        if ( !source )
            return {};

        if ( target === 'Entire screen' ) {
            
            return {
                image: source.thumbnail.toPNG()
            }
        }

        return {
            image: source.thumbnail.toPNG(),
            windowProps
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
}