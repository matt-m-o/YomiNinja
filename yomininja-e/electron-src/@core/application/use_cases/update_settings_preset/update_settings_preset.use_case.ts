import { SettingsPreset, SettingsPresetJson } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetRepository } from "../../../domain/settings_preset/settings_preset.repository";

export interface UpdateSettingsPreset_Input extends SettingsPresetJson {
}

export class UpdateSettingsPresetUseCase {

    constructor(
        public settingsPresetRepo: SettingsPresetRepository,
    ) {}

    async execute( input: UpdateSettingsPreset_Input ): Promise< void > {        

        const settingsPreset = await this.settingsPresetRepo.findOne({ id: input.id });

        if ( !settingsPreset )
            return;

        settingsPreset.name = input.name;
        settingsPreset.updateOverlaySettings(input.overlay);

        await this.settingsPresetRepo.update( settingsPreset );
    }
}