import { SettingsPreset } from "./settings_preset";


export interface SettingsPresetRepository {

    insert( settingsPreset: SettingsPreset ): Promise< void >;
    update( settingsPreset: SettingsPreset ): Promise< void >;
    findOne( name: string ): Promise< SettingsPreset | null >;
    getAll(): Promise< SettingsPreset[] >
}