import { GetActiveSettingsPresetUseCase } from "../@core/application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { GetSupportedLanguagesUseCase } from "../@core/application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { getActiveProfile } from "../@core/infra/app_initialization";


export class OverlayService {
    
    private getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;

    constructor( input: {        
        getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase,
    }){        
        this.getActiveSettingsPresetUseCase = input.getActiveSettingsPresetUseCase;
    }


    async getActiveSettingsPreset() {
        return await this.getActiveSettingsPresetUseCase.execute({
            profileId: getActiveProfile().id
        });
    }
}