import '../electron-src/@core/infra/container_registry/container_registry';
import { SettingsPreset } from "./@core/domain/settings_preset/settings_preset";
import { get_MainDataSource } from "./@core/infra/container_registry/db_registry";
import { get_SettingsPresetRepository } from "./@core/infra/container_registry/repositories_registry";

export async function initializeApp() {
    
    try {
        const mainDataSource = await get_MainDataSource();
        await mainDataSource.initialize();

        const settingsPresetRepository = get_SettingsPresetRepository();

        const defaultSettingsPreset = await settingsPresetRepository.findOne({ name: SettingsPreset.default_name });

        if (!defaultSettingsPreset) {

            // Inserting default settings preset
            await settingsPresetRepository.insert(
                SettingsPreset.create()
            );
        }
    } catch (error) {
        console.error( error )
    }
}