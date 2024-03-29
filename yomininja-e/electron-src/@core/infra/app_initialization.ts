import './container_registry/container_registry';
import { Language, Language_CreationInput } from '../domain/language/language';
import { Profile } from '../domain/profile/profile';
import { SettingsPreset } from "../domain/settings_preset/settings_preset";
import { get_DictionaryDataSource, get_MainDataSource } from "./container_registry/db_registry";
import { get_LanguageRepository, get_ProfileRepository, get_SettingsPresetRepository } from "./container_registry/repositories_registry";
import os from 'os';
import LanguageTypeOrmRepository from './db/typeorm/language/language.typeorm.repository';
import { applyCpuHotfix } from './ppocr.adapter/hotfix/hardware_compatibility_hotfix';
import { get_CreateSettingsPresetUseCase, get_GetActiveSettingsPresetUseCase, get_UpdateSettingsPresetUseCase } from './container_registry/use_cases_registry';
import { get_PpOcrAdapter } from './container_registry/adapters_registry';
import { WindowManager } from '../../../gyp_modules/window_management/window_manager';


export let activeProfile: Profile;
export let windowManager: WindowManager;


async function populateLanguagesRepository( languageRepo: LanguageTypeOrmRepository ) {
    const languages: Language_CreationInput[] = [
        { name: 'japanese', two_letter_code: 'ja' },
        { name: 'english', two_letter_code: 'en' },
        { name: 'chinese', two_letter_code: 'ch' },
        { name: 'korean', two_letter_code: 'ko' },
    ]
    for ( const data of languages ) {
        const exists = await languageRepo.findOne({ two_letter_code: data.two_letter_code });

        if ( exists ) continue;

        await languageRepo.insert( Language.create( data ) )
            .catch( console.error );
    }    
}

export async function initializeApp() {
    
    try {

        // Initializing database
        await get_MainDataSource().initialize();
        const datasource = await get_DictionaryDataSource().initialize();
        
        // Setting database cache size
        const dbSize = 100 * 1024; // KB
        const defaultPageSize = 4; // KB
        const cacheSize = dbSize / defaultPageSize;

        const queryRunner = datasource.createQueryRunner();        
        await queryRunner.query(`PRAGMA cache_size = ${cacheSize};`);         
        await queryRunner.release();


        // Getting repositories 
        const languageRepo = get_LanguageRepository();
        const settingsPresetRepo = get_SettingsPresetRepository();
        const profileRepo = get_ProfileRepository();

        await populateLanguagesRepository( languageRepo );

        const ppocrAdapter = get_PpOcrAdapter();
        await new Promise( resolve => ppocrAdapter.startProcess( resolve ) );
        await ppocrAdapter.ppocrServiceProcessStatusCheck();

        // console.log('Initializing settings...');
        let defaultSettingsPreset = await settingsPresetRepo.findOne({ name: SettingsPreset.default_name });
        if ( !defaultSettingsPreset ) {

            // Creating default settings preset
            await get_CreateSettingsPresetUseCase().execute();            

            defaultSettingsPreset = await settingsPresetRepo.findOne({ name: SettingsPreset.default_name }) as SettingsPreset ;
        }
        else {
            await get_UpdateSettingsPresetUseCase().execute({
                ...defaultSettingsPreset.toJson(),
                options: {
                    restartOcrEngine: true
                }
            });
        }
        await ppocrAdapter.ppocrServiceProcessStatusCheck();

        
        // console.log('Initializing languages...');
        let defaultLanguage = await languageRepo.findOne({ name: 'japanese' });
        if ( !defaultLanguage ) {
            
            // Creating default language
            defaultLanguage = Language.create({ name: 'japanese', two_letter_code: 'ja' });
            await languageRepo.insert( defaultLanguage );
        }

        // console.log('Initializing profiles...');
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

        windowManager = new WindowManager();
        await windowManager.init();

        // console.log('Initialization completed!');
    } catch (error) {
        console.error( error )
    }
}


export function getActiveProfile(): Profile {
    return activeProfile;
}