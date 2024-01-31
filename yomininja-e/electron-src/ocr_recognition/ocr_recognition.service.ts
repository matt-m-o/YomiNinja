import { desktopCapturer } from "electron";
import { TaskbarProperties, WindowManager, WindowProperties } from "../../gyp_modules/window_management/window_manager";
import { GetSupportedLanguagesUseCase } from "../@core/application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { RecognizeImageUseCase } from "../@core/application/use_cases/recognize_image/recognize_image.use_case";
import { OcrResultScalable } from "../@core/domain/ocr_result_scalable/ocr_result_scalable";
import { GetActiveSettingsPresetUseCase } from "../@core/application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { getActiveProfile, windowManager } from "../@core/infra/app_initialization";
import { OcrAdapter } from "../@core/application/adapters/ocr.adapter";
import { Language } from "../@core/domain/language/language";
import { CaptureSource, ExternalWindow } from "./common/types";
import sharp from 'sharp';


export const entireScreenAutoCaptureSource: CaptureSource = {
    id: '',
    name: 'Entire screen',
    displayId: -1,
    type: 'screen',
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
    }): Promise< OcrResultScalable | null > {
        console.log('ocrRecognitionService.recognize');

        let { imageBuffer, profileId } = input;


        // displayImage( imageBuffer as Buffer );

        if ( !imageBuffer )
            return null;

        // const isValidImage = await this.isValidImage( imageBuffer );
        // console.log({ isValidImage });

        // if ( !isValidImage ) return null;

        return await this.recognizeImageUseCase.execute({
            imageBuffer,
            profileId: profileId,
        });
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
