import { GetActiveSettingsPresetUseCase } from "../@core/application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { UpdateSettingsPresetUseCase } from "../@core/application/use_cases/update_settings_preset/update_settings_preset.use_case";
import { SettingsPreset, SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import { UpdateSettingsPresetUseCaseInstance } from "../@core/infra/types/use_case_instance.types";


export class SettingsService {

    private getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;
    private updateSettingsPresetUseCase: UpdateSettingsPresetUseCaseInstance;

    constructor(
        input: {
            getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;
            updateSettingsPresetUseCase: UpdateSettingsPresetUseCaseInstance;
        }
    ){
        this.getActiveSettingsPresetUseCase = input.getActiveSettingsPresetUseCase;
        this.updateSettingsPresetUseCase = input.updateSettingsPresetUseCase;        
    }

    async getActiveSettings( input: { profileId: string }): Promise< SettingsPreset | null > {
        
        return await this.getActiveSettingsPresetUseCase.execute({
            ...input,
        });
    }

    async updateSettingsPreset( settingsPresetJson: SettingsPresetJson ) {

        return await this.updateSettingsPresetUseCase.execute( settingsPresetJson );
    }
}