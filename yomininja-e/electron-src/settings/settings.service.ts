import { GetActiveSettingsPresetUseCase } from "../@core/application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { SettingsPreset } from "../@core/domain/settings_preset/settings_preset";


export class SettingsService {

    private getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;    

    constructor(
        input: {
            getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;            
        }
    ){
        this.getActiveSettingsPresetUseCase = input.getActiveSettingsPresetUseCase;        
    }

    async getActiveSettings( input: { profileId: string }): Promise< SettingsPreset | null > {
        
        return await this.getActiveSettingsPresetUseCase.execute({
            ...input,
        });        
    }

    private async updateActiveSettings( settingsPreset: SettingsPreset ): Promise< void > {
    }
}