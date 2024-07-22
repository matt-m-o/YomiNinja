import './container_registry/container_registry';
import { Language, Language_CreationInput } from '../domain/language/language';
import { Profile } from '../domain/profile/profile';
import { SettingsPreset } from "../domain/settings_preset/settings_preset";
import { get_DictionaryDataSource, get_MainDataSource } from "./container_registry/db_registry";
import { get_LanguageRepository, get_ProfileRepository, get_SettingsPresetRepository } from "./container_registry/repositories_registry";
import os from 'os';
import LanguageTypeOrmRepository from './db/typeorm/language/language.typeorm.repository';
import { applyCpuHotfix } from './ocr/ppocr.adapter/hotfix/hardware_compatibility_hotfix';
import { get_CreateSettingsPresetUseCaseInstance, get_GetActiveSettingsPresetUseCase, get_UpdateSettingsPresetUseCaseInstance } from './container_registry/use_cases_registry';
import { get_PpOcrAdapter } from './container_registry/adapters_registry';
import { WindowManager } from '../../../gyp_modules/window_management/window_manager';
import { ppOcrAdapterName } from './ocr/ppocr.adapter/ppocr_settings';
import { getDefaultSettingsPresetProps } from '../domain/settings_preset/default_settings_preset_props';
import semver from 'semver';
import { cloudVisionOcrAdapterName, getCloudVisionDefaultSettings } from './ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings';
import { getGoogleLensDefaultSettings, googleLensOcrAdapterName } from './ocr/google_lens_ocr.adapter/google_lens_ocr_settings';
import { pyOcrService } from './ocr/py_ocr_service/_temp_index';
import { paddleOcrService } from './ocr/ocr_services/paddle_ocr_service/_temp_index';

const isMacOS = process.platform === 'darwin';
export let activeProfile: Profile;
export let windowManager: WindowManager;


async function populateLanguagesRepository( languageRepo: LanguageTypeOrmRepository ) {

    const languages: Language_CreationInput[] = [
        { name: 'japanese', two_letter_code: 'ja', bcp47_tag: 'ja-JP' },
        { name: 'chinese (simplified)', two_letter_code: 'zh', bcp47_tag: 'zh-Hans' },
        { name: 'chinese (traditional)', two_letter_code: 'zh', bcp47_tag: 'zh-Hant' },
        { name: 'cantonese (simplified)', two_letter_code: '', bcp47_tag: 'yue-Hans' },
        { name: 'cantonese (traditional)', two_letter_code: '', bcp47_tag: 'yue-Hant' },
        { name: 'korean', two_letter_code: 'ko', bcp47_tag: 'ko-KR' },
        { name: 'thai', two_letter_code: 'th', bcp47_tag: 'th-TH' },
        { name: 'vietnamese', two_letter_code: 'vi', bcp47_tag: 'vi-VN' },
        { name: 'latin', two_letter_code: 'la', bcp47_tag: 'la' },
        { name: 'cyrillic', two_letter_code: 'cy', bcp47_tag: 'cyrl' },
        { name: 'english', two_letter_code: 'en', bcp47_tag: 'en' },
        { name: 'french (FR)', two_letter_code: 'fr', bcp47_tag: 'fr-FR' },
        { name: 'italian (IT)', two_letter_code: 'it', bcp47_tag: 'it-IT' },
        { name: 'german (DE)', two_letter_code: 'de', bcp47_tag: 'de-DE' },
        { name: 'spanish (ES)', two_letter_code: 'es', bcp47_tag: 'es-ES' },
        { name: 'portuguese (BR)', two_letter_code: 'pt', bcp47_tag: 'pt-BR' },
        { name: 'russian', two_letter_code: 'ru', bcp47_tag: 'ru-RU' },
        { name: 'ukrainian', two_letter_code: 'uk', bcp47_tag: 'uk-UA' },
    ];

    for ( const data of languages ) {

        const exists = await languageRepo.findOne({ name: data.name });
        
        if ( exists ) {

            if ( exists.bcp47_tag ) continue;

            // Adding bcp47 tag to older records
            exists.bcp47_tag = data.bcp47_tag as string;

            await languageRepo.update( exists );

            continue;
        }
        else if ( data.bcp47_tag === 'zh-Hans' ) {
            // Updating the old chinese record

            const oldChinese = await languageRepo.findOne({ name: 'chinese' });
            if ( oldChinese ) {

                oldChinese.name = data.name;
                oldChinese.two_letter_code = data.two_letter_code;
                oldChinese.bcp47_tag = data.bcp47_tag;

                await languageRepo.update(oldChinese);

                continue;
            }
        }

        await languageRepo.insert( Language.create( data ) )
            .catch( console.error );
    }
}

export async function initializeApp() {
    
    try {

        const serviceStartupPromise = startServices();

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

        await serviceStartupPromise;

        // console.log('Initializing settings...');
        let defaultSettingsPreset = await settingsPresetRepo.findOne({ name: SettingsPreset.default_name });
        if ( !defaultSettingsPreset ) {

            // Creating default settings preset
            await get_CreateSettingsPresetUseCaseInstance().execute();

            defaultSettingsPreset = await settingsPresetRepo.findOne({ name: SettingsPreset.default_name }) as SettingsPreset ;
        }
        else {

            const defaultSettingsProps = getDefaultSettingsPresetProps();

            let settingsPresetUpdateData = defaultSettingsPreset.toJson();

            // const settingsAreTooOld = !semver.gte( settingsPresetUpdateData.version, defaultSettingsProps.version );

            if (
                !settingsPresetUpdateData?.version ||
                settingsPresetUpdateData.version !== defaultSettingsProps.version
            ) {
                settingsPresetUpdateData = {
                    ...defaultSettingsProps,
                    id: settingsPresetUpdateData.id,
                };
            }

            /// Migrating from v0.6 to v0.6.1 -----------------------------------
            const cloudVisionSettings = settingsPresetUpdateData.ocr_engines.find(
                item => item.ocr_adapter_name === cloudVisionOcrAdapterName
            );

            const defaultGoogleLensSettings = getGoogleLensDefaultSettings();

            if ( cloudVisionSettings?.hotkey === defaultGoogleLensSettings.hotkey ) {
                cloudVisionSettings.hotkey = getCloudVisionDefaultSettings().hotkey;
            }
            /// ------------------------------------------------------------------

            await get_UpdateSettingsPresetUseCaseInstance().execute({
                ...settingsPresetUpdateData,
                options: {
                    restartOcrEngine: true
                }
            });
        }

        await servicesHealthCheck();

        
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
                selected_ocr_adapter_name: isMacOS ? googleLensOcrAdapterName : ppOcrAdapterName
            });
            await profileRepo.insert(defaultProfile);
        }
        
        if ( !defaultProfile?.selected_ocr_adapter_name ) {
            defaultProfile.selected_ocr_adapter_name = ppOcrAdapterName;
            await profileRepo.update( defaultProfile );
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

async function startServices() {

    const serviceStartupPromises: Promise<unknown>[] = [];

    if ( !isMacOS ) {
        serviceStartupPromises.push(
            new Promise( resolve => paddleOcrService.startProcess( resolve ) )
        );
    }
    serviceStartupPromises.push( new Promise( resolve => pyOcrService.startProcess( resolve ) ) );

    await Promise.all( serviceStartupPromises );
    await servicesHealthCheck();
}

async function servicesHealthCheck() {

    const serviceHealthCheckPromises: Promise<unknown>[] = [];

    if ( !isMacOS ) {
        serviceHealthCheckPromises.push( paddleOcrService.processStatusCheck() )
    }
    serviceHealthCheckPromises.push( pyOcrService.processStatusCheck() )

    await Promise.all( serviceHealthCheckPromises );
}