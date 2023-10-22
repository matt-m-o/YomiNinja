import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { GetSupportedLanguagesUseCase } from "../../application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { RecognizeImageUseCase } from "../../application/use_cases/recognize_image/recognize_image.use_case";
import { get_SettingsPresetRepository } from "./repositories_registry";
import { GetActiveSettingsPresetUseCase } from "../../application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { UpdateSettingsPresetUseCase } from "../../application/use_cases/update_settings_preset/update_settings_preset.use_case";
import { CheckForAppUpdatesUseCase } from "../../application/use_cases/check_for_app_updates/check_for_app_updates.use_case";
import { ChangeActiveOcrLanguageUseCase } from "../../application/use_cases/change_active_ocr_language/change_active_ocr_language.use_case";
import { GetProfileUseCase } from "../../application/use_cases/get_profile/get_profile.use_case";
import { ImportYomichanDictionaryUseCase } from "../../application/use_cases/dictionary/import_yomichan_dictionary/import_yomichan_dictionary.use_case";


container_registry.bind( Registry.RecognizeImageUseCase )
    .toDynamicValue( (context) => {
        return new RecognizeImageUseCase(
            [
                context.container.get( Registry.PpOcrAdapter ),
            ],
            context.container.get( Registry.SharpImageProcessingAdapter ),
            context.container.get( Registry.ProfileTypeOrmRepository ),
        );
    })
    .inSingletonScope();

container_registry.bind( Registry.GetSupportedLanguagesUseCase )
    .toDynamicValue( (context) => {
        return new GetSupportedLanguagesUseCase(
            [ context.container.get( Registry.PpOcrAdapter ) ],
            context.container.get( Registry.LanguageTypeOrmRepository ),
        );
    })
    .inSingletonScope();


container_registry.bind( Registry.GetActiveSettingsPresetUseCase )
    .toDynamicValue( (context) => {
        return new GetActiveSettingsPresetUseCase(
            context.container.get( Registry.ProfileTypeOrmRepository ),
        );
    })
    .inSingletonScope();

container_registry.bind( Registry.UpdateSettingsPresetUseCase )
    .toDynamicValue( (context) => {
        return new UpdateSettingsPresetUseCase(
            context.container.get( Registry.SettingsPresetTypeOrmRepository ),
            context.container.get( Registry.PpOcrAdapter ),
        );
    })
    .inSingletonScope();

container_registry.bind( Registry.CheckForAppUpdatesUseCase )
    .toDynamicValue( (context) => {
        return new CheckForAppUpdatesUseCase(
            context.container.get( Registry.GithubAppVersionProviderAdapter ),
        );
    })
    .inSingletonScope();

container_registry.bind( Registry.ChangeActiveOcrLanguageUseCase )
    .toDynamicValue( (context) => {
        return new ChangeActiveOcrLanguageUseCase(
            context.container.get( Registry.ProfileTypeOrmRepository ),
            context.container.get( Registry.LanguageTypeOrmRepository ),
        );
    })
    .inSingletonScope();

container_registry.bind( Registry.GetProfileUseCase )
    .toDynamicValue( (context) => {
        return new GetProfileUseCase(
            context.container.get( Registry.ProfileTypeOrmRepository ),        
        );
    })
    .inSingletonScope();

container_registry.bind( Registry.ImportYomichanDictionaryUseCase )
    .toDynamicValue( (context) => {
        return new ImportYomichanDictionaryUseCase({
            dictionariesRepo: context.container.get(
                Registry.DictionaryTypeOrmRepository
            ),
            tagsRepo: context.container.get(
                Registry.DictionaryTagTypeOrmRepository
            ),
            definitionsRepo: context.container.get(
                Registry.DictionaryDefinitionTypeOrmRepository
            ),
            headwordsRepo: context.container.get(
                Registry.DictionaryHeadwordTypeOrmRepository
            ),
        });
    })
    .inSingletonScope();


export function get_RecognizeImageUseCase(): RecognizeImageUseCase {
    return container_registry.get< RecognizeImageUseCase >( Registry.RecognizeImageUseCase )
}

export function get_GetSupportedLanguagesUseCase(): GetSupportedLanguagesUseCase {    
    return container_registry.get< GetSupportedLanguagesUseCase >( Registry.GetSupportedLanguagesUseCase );
}

export function get_GetActiveSettingsPresetUseCase(): GetActiveSettingsPresetUseCase {    
    return container_registry.get< GetActiveSettingsPresetUseCase >( Registry.GetActiveSettingsPresetUseCase );
}

export function get_UpdateSettingsPresetUseCase(): UpdateSettingsPresetUseCase {    
    return container_registry.get< UpdateSettingsPresetUseCase >( Registry.UpdateSettingsPresetUseCase );
}

export function get_CheckForAppUpdatesUseCase(): CheckForAppUpdatesUseCase {    
    return container_registry.get< CheckForAppUpdatesUseCase >( Registry.CheckForAppUpdatesUseCase );
}

export function get_ChangeActiveOcrLanguageUseCase(): ChangeActiveOcrLanguageUseCase {    
    return container_registry.get< ChangeActiveOcrLanguageUseCase >( Registry.ChangeActiveOcrLanguageUseCase );
}

export function get_GetProfileUseCase(): GetProfileUseCase {    
    return container_registry.get< GetProfileUseCase >( Registry.GetProfileUseCase );
}


export function get_ImportYomichanDictionaryUseCase(): ImportYomichanDictionaryUseCase {    
    return container_registry.get< ImportYomichanDictionaryUseCase >( Registry.ImportYomichanDictionaryUseCase );
}
