import { desktopCapturer } from "electron";
import { WindowManager, WindowProperties } from "../../gyp_modules/window_management/window_manager";
import { GetSupportedLanguagesUseCase } from "../@core/application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { RecognizeImageUseCase } from "../@core/application/use_cases/recognize_image/recognize_image.use_case";
import { OcrResultScalable } from "../@core/domain/ocr_result_scalable/ocr_result_scalable";
import { GetActiveSettingsPresetUseCase } from "../@core/application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { activeProfile } from "../app_initialization";
// import sharp from "sharp";


export class OcrRecognitionService {

    private recognizeImageUseCase: RecognizeImageUseCase;
    private getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;
    private getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;

    private windowManager = new WindowManager();

    constructor(
        input: {
            recognizeImageUseCase: RecognizeImageUseCase;
            getSupportedLanguagesUseCase: GetSupportedLanguagesUseCase;
            getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;
        }
    ){
        this.recognizeImageUseCase = input.recognizeImageUseCase;
        this.getSupportedLanguagesUseCase = input.getSupportedLanguagesUseCase;
        this.getActiveSettingsPresetUseCase = input.getActiveSettingsPresetUseCase;
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

        // console.time("Sharp.resize");
        // imageBuffer = await sharp( imageBuffer ).resize(1280, 720).toBuffer();
        // console.timeEnd("Sharp.resize");

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
                width: windowProps?.size.width || 1280, // workAreaSize.width, // 2560 // 1920
                height: windowProps?.size.height || 720, // workAreaSize.height, // 1440 // 1080
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
        return await this.getActiveSettingsPresetUseCase.execute({ profileId: activeProfile.id })
    }
}