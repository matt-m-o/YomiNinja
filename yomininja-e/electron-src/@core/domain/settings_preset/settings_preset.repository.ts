import { SettingsPreset } from "./settings_preset";

export type SettingsPresetRepoFindOneInput = {
    id?: string;
    name?: string;
}

export interface SettingsPresetRepository {

    insert( settingsPreset: SettingsPreset ): Promise< void >;

    update( settingsPreset: SettingsPreset ): Promise< void >;

    findOne( input: SettingsPresetRepoFindOneInput ): Promise< SettingsPreset | null >;

    getAll(): Promise< SettingsPreset[] >;

    delete( id: string ): Promise< void >;
}