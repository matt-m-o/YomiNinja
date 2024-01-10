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
import { GetSupportedLanguagesUseCaseInstance, RecognizeImageUseCaseInstance } from "../@core/infra/types/use_case_instance.types";
import { PpOcrAdapter } from "../@core/infra/ppocr.adapter/ppocr.adapter";
import { OcrEngineSettingsU } from "../@core/infra/types/entity_instance.types";


export const entireScreenAutoCaptureSource: CaptureSource = {
    id: '',
    name: 'Entire screen',
    displayId: -1,
    type: 'screen',
};

export class OcrRecognitionService {

    private recognizeImageUseCase: RecognizeImageUseCaseInstance;
    private getSupportedLanguagesUseCase: GetSupportedLanguagesUseCaseInstance;
    private getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;    
    private ocrAdapters: OcrAdapter< OcrEngineSettingsU >[];    

    constructor(
        input: {
            recognizeImageUseCase: RecognizeImageUseCaseInstance;
            getSupportedLanguagesUseCase: GetSupportedLanguagesUseCaseInstance;
            getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;            
            ocrAdapters: OcrAdapter< OcrEngineSettingsU >[];
        }
    ){
        this.recognizeImageUseCase = input.recognizeImageUseCase;
        this.getSupportedLanguagesUseCase = input.getSupportedLanguagesUseCase;
        this.getActiveSettingsPresetUseCase = input.getActiveSettingsPresetUseCase;
        this.ocrAdapters = input.ocrAdapters;
    }

    async recognize( input: {
        imageBuffer?: Buffer;
        profileId: string;
        engineName?: string;
    }): Promise< OcrResultScalable | null > {
        console.log('ocrRecognitionService.recognize');

        let { imageBuffer, profileId, engineName } = input;


        // displayImage( imageBuffer as Buffer );

        if ( !imageBuffer )
            return null;

        // const isValidImage = await this.isValidImage( imageBuffer );
        // console.log({ isValidImage });

        // if ( !isValidImage ) return null;

        return await this.recognizeImageUseCase.execute({
            imageBuffer,
            profileId: profileId,
            ocrAdapterName: engineName
        });
    }

    async getActiveSettingsPreset() {
        return await this.getActiveSettingsPresetUseCase.execute({
            profileId: getActiveProfile().id
        });
    }

    restartOcrAdapter( engineName: string, callback:() => void ) {

        const engine = this.ocrAdapters.find( item => item.name === engineName );

        if ( !engine ) return;

        engine.restart( callback );
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
