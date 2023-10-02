import './container_registry/container_registry';
import { Language } from '../domain/language/language';
import { Profile } from '../domain/profile/profile';
import { SettingsPreset } from "../domain/settings_preset/settings_preset";
import { get_MainDataSource } from "./container_registry/db_registry";
import { get_LanguageRepository, get_ProfileRepository, get_SettingsPresetRepository } from "./container_registry/repositories_registry";
import os from 'os';

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
            defaultSettingsPreset = SettingsPreset.create();
            defaultSettingsPreset.updateOcrEngineSettings({ cpu_threads: os.cpus().length });
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


export function getActiveProfile(): Profile {
    return activeProfile;
}