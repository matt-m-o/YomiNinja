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
import { ExtractTermsFromTextUseCase } from "../../application/use_cases/dictionary/extract_terms_from_text/extract_terms_from_text.use_case";
import { SearchDictionaryTermUseCase } from "../../application/use_cases/dictionary/search_dictionary_term/search_dictionary_term.use_case";
import { ImportFuriganaDictionaryUseCase } from "../../application/use_cases/dictionary/import_furigana_dictionary/import_furigana_dictionary.use_case";
import { GetDictionariesUseCase } from "../../application/use_cases/dictionary/get_dictionaries/get_dictionaries.use_case";
import { DeleteAllDictionariesUseCase } from "../../application/use_cases/dictionary/delete_all_dictionaries/delete_all_dictionaries.use_case";
import { CreateSettingsPresetUseCase } from "../../application/use_cases/create_settings_preset/create_settings_preset.use_case";


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
            japaneseHelper: context.container.get(
                Registry.JapaneseHelper
            ),
        });
    })
    .inSingletonScope();


container_registry.bind( Registry.ExtractTermsFromTextUseCase )
    .toDynamicValue( (context) => {
        return new ExtractTermsFromTextUseCase({
            termExtractor: context.container.get(
                Registry.KuromojiTermExtractor
            )
        })
    });

container_registry.bind( Registry.SearchDictionaryTermUseCase )
    .toDynamicValue( (context) => {
        return new SearchDictionaryTermUseCase({
            dictionariesRepo: context.container.get(
                Registry.DictionaryTypeOrmRepository
            ),
            headwordsRepo: context.container.get(
                Registry.DictionaryHeadwordTypeOrmRepository
            ),
        })
    });


container_registry.bind( Registry.ImportFuriganaDictionaryUseCase )
    .toDynamicValue( (context) => {
        return new ImportFuriganaDictionaryUseCase({            
            headwordsRepo: context.container.get(
                Registry.DictionaryHeadwordTypeOrmRepository
            ),
        })
    });
    

container_registry.bind( Registry.GetDictionariesUseCase )
    .toDynamicValue( (context) => {
        return new GetDictionariesUseCase({            
            dictionariesRepo: context.container.get(
                Registry.DictionaryTypeOrmRepository
            ),
        })
    });


container_registry.bind( Registry.DeleteAllDictionariesUseCase )
    .toDynamicValue( (context) => {
        return new DeleteAllDictionariesUseCase({            
            dictionariesRepo: context.container.get(
                Registry.DictionaryTypeOrmRepository
            ),
            definitionsRepo: context.container.get(
                Registry.DictionaryDefinitionTypeOrmRepository
            ),
            headwordsRepo: context.container.get(
                Registry.DictionaryHeadwordTypeOrmRepository
            ),
            tagsRepo: context.container.get(
                Registry.DictionaryTagTypeOrmRepository
            ),
        })
    });

container_registry.bind( Registry.CreateSettingsPresetUseCase )
    .toDynamicValue( (context) => {
        return new CreateSettingsPresetUseCase({            
            settingsPresetRepo: context.container.get(
                Registry.SettingsPresetTypeOrmRepository
            ),
            ocrAdapter: context.container.get(
                Registry.PpOcrAdapter
            ),
        })
    });


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

export function get_ImportFuriganaDictionaryUseCasee(): ImportFuriganaDictionaryUseCase {    
    return container_registry.get< ImportFuriganaDictionaryUseCase >( Registry.ImportFuriganaDictionaryUseCase );
}

export function get_ExtractTermsFromTextUseCase(): ExtractTermsFromTextUseCase {    
    return container_registry.get< ExtractTermsFromTextUseCase >( Registry.ExtractTermsFromTextUseCase );
}

export function get_SearchDictionaryTermUseCase(): SearchDictionaryTermUseCase {    
    return container_registry.get< SearchDictionaryTermUseCase >( Registry.SearchDictionaryTermUseCase );
}

export function get_GetDictionariesUseCase(): GetDictionariesUseCase {    
    return container_registry.get< GetDictionariesUseCase >( Registry.GetDictionariesUseCase );
}

export function get_DeleteAllDictionariesUseCase(): DeleteAllDictionariesUseCase {    
    return container_registry.get< DeleteAllDictionariesUseCase >( Registry.DeleteAllDictionariesUseCase );
}

export function get_CreateSettingsPresetUseCase(): CreateSettingsPresetUseCase {    
    return container_registry.get< CreateSettingsPresetUseCase >( Registry.CreateSettingsPresetUseCase );
}