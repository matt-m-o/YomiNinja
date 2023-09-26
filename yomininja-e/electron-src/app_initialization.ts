import '../electron-src/@core/infra/container_registry/container_registry';
import { Language } from './@core/domain/language/language';
import { Profile } from './@core/domain/profile/profile';
import { SettingsPreset } from "./@core/domain/settings_preset/settings_preset";
import { get_MainDataSource } from "./@core/infra/container_registry/db_registry";
import { get_LanguageRepository, get_ProfileRepository, get_SettingsPresetRepository } from "./@core/infra/container_registry/repositories_registry";

export let activeProfile: Profile;

export async function initializeApp() {
    
    try {

        // Initializing database
        const mainDataSource = await get_MainDataSource();
        await mainDataSource.initialize();

        // Getting repositories 
        const languageRepo = get_LanguageRepository();
        const settingsPresetRepo = get_SettingsPresetRepository();
        const profileRepo = get_ProfileRepository();

        let defaultSettingsPreset = await settingsPresetRepo.findOne({ name: SettingsPreset.default_name });
        if ( !defaultSettingsPreset ) {

            // Creating default settings preset
            defaultSettingsPreset = SettingsPreset.create()
            await settingsPresetRepo.insert( defaultSettingsPreset );
        }

        let defaultLanguage = await languageRepo.findOne({ name: 'japanese' });
        if ( !defaultLanguage ) {
            
            // Creating default language
            defaultLanguage = Language.create({ name: 'japanese', two_letter_code: 'ja' });
            await languageRepo.insert( defaultLanguage );
        }

        let defaultProfile = await profileRepo.findOne({ name: 'default' });
        if ( !defaultProfile ) {

            // Creating default profile
            defaultProfile = Profile.create({
                active_ocr_language: defaultLanguage,
                active_settings_preset: defaultSettingsPreset,                    
            });
            await profileRepo.insert(defaultProfile);
        }

        activeProfile = defaultProfile;

    } catch (error) {
        console.error( error )
    }
}