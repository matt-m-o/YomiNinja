import { SettingsPreset } from "./settings_preset";

export type SettingsPresetFindOneInput = {
    id?: string;
    name?: string;
}

export interface SettingsPresetRepository {

    insert( settingsPreset: SettingsPreset ): Promise< void >;

    update( settingsPreset: SettingsPreset ): Promise< void >;

    findOne( input: SettingsPresetFindOneInput ): Promise< SettingsPreset | null >;

    getAll(): Promise< SettingsPreset[] >;

    delete( id: string ): Promise< void >;
}