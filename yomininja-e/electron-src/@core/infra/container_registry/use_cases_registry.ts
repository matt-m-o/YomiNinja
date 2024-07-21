import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { GetSupportedLanguagesUseCase } from "../../application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { RecognizeImageUseCase } from "../../application/use_cases/recognize_image/recognize_image.use_case";
import { get_OcrTemplateRepository, get_SettingsPresetRepository } from "./repositories_registry";
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
import { CreateOcrTemplateUseCase } from "../../application/use_cases/ocr_template/create_ocr_template/create_ocr_template.use_case";
import { UpdateOcrTemplateUseCase } from "../../application/use_cases/ocr_template/update_ocr_template/update_ocr_template.use_case";
import { GetOcrTemplatesUseCase } from "../../application/use_cases/ocr_template/get_ocr_template/get_ocr_templates.use_case";
import { DeleteOcrTemplateUseCase } from "../../application/use_cases/ocr_template/delete_ocr_template/delete_ocr_template.use_case";
import { ChangeActiveOcrTemplateUseCase } from "../../application/use_cases/change_active_ocr_template/change_active_ocr_template.use_case";
import { OcrEngineSettingsU } from "../types/entity_instance.types";
import { CreateSettingsPresetUseCaseInstance, GetSupportedLanguagesUseCaseInstance, RecognizeImageUseCaseInstance, UpdateSettingsPresetUseCaseInstance } from "../types/use_case_instance.types";
import { ChangeSelectedOcrEngineUseCase } from "../../application/use_cases/change_selected_ocr_engine/change_selected_ocr_engine.use_case";
import { CreateBrowserExtensionUseCase } from "../../application/use_cases/browser_extension/create_browser_extension/create_browser_extension.use_case";
import { UpdateBrowserExtensionUseCase } from "../../application/use_cases/browser_extension/update_browser_extension/update_browser_extension.use_case";
import { GetBrowserExtensionsUseCase } from "../../application/use_cases/browser_extension/get_browser_extensions/get_browser_extensions.use_case";
import { PyVideoAnalyzerAdapter } from "../ocr/py_video_analyzer.adapter/py_video_analyzer.adapter";

export let enabledOcrEngines: symbol[] = [
    Registry.CloudVisionOcrAdapter,
    Registry.GoogleLensOcrAdapter,
];
if ( process.platform !== 'darwin' ) {
    enabledOcrEngines = [
        ...enabledOcrEngines,
        Registry.PpOcrAdapter,
        Registry.MangaOcrAdapter
    ];
}
if ( process.platform === 'darwin' ) {
    enabledOcrEngines.push(
        Registry.AppleVisionAdapter
    );
}

container_registry.bind( Registry.RecognizeImageUseCaseInstance )
    .toDynamicValue( ( context ) => {
        return new RecognizeImageUseCase< OcrEngineSettingsU >(
            enabledOcrEngines.map( symbol => context.container.get(symbol) ),
            context.container.get( Registry.SharpImageProcessingAdapter ),
            context.container.get( Registry.ProfileTypeOrmRepository ),
            new PyVideoAnalyzerAdapter()
        );
    })
    .inSingletonScope();

container_registry.bind( Registry.GetSupportedLanguagesUseCaseInstance )
    .toDynamicValue( (context) => {
        return new GetSupportedLanguagesUseCase< OcrEngineSettingsU >(
            enabledOcrEngines.map( symbol => context.container.get(symbol) ),
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

container_registry.bind( Registry.UpdateSettingsPresetUseCaseInstance )
    .toDynamicValue( (context) => {
        return new UpdateSettingsPresetUseCase< OcrEngineSettingsU >(
            context.container.get( Registry.SettingsPresetTypeOrmRepository ),
            enabledOcrEngines.map( symbol => context.container.get(symbol) ),
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

container_registry.bind( Registry.CreateSettingsPresetUseCaseInstance )
    .toDynamicValue( (context) => {
        return new CreateSettingsPresetUseCase< OcrEngineSettingsU >({            
            settingsPresetRepo: context.container.get(
                Registry.SettingsPresetTypeOrmRepository
            ),
            ocrAdapters: enabledOcrEngines.map( symbol => context.container.get(symbol) ),
        })
    });

container_registry.bind( Registry.CreateOcrTemplateUseCase )
    .toDynamicValue( (context) => {
        return new CreateOcrTemplateUseCase({            
            ocrTemplateRepo: context.container.get(
                Registry.OcrTemplateTypeOrmRepository
            ),
            ocrTargetRegionRepo: context.container.get(
                Registry.OcrTargetRegionTypeOrmRepository
            ),
        })
    });

container_registry.bind( Registry.UpdateOcrTemplateUseCase )
    .toDynamicValue( (context) => {
        return new UpdateOcrTemplateUseCase({            
            ocrTemplateRepo: context.container.get(
                Registry.OcrTemplateTypeOrmRepository
            ),
            ocrTargetRegionRepo: context.container.get(
                Registry.OcrTargetRegionTypeOrmRepository
            ),
        })
    });

container_registry.bind( Registry.GetOcrTemplatesUseCase )
    .toDynamicValue( (context) => {
        return new GetOcrTemplatesUseCase({
            ocrTemplateRepo: context.container.get(
                Registry.OcrTemplateTypeOrmRepository
            ),
        })
    });

container_registry.bind( Registry.DeleteOcrTemplateUseCase )
    .toDynamicValue( (context) => {
        return new DeleteOcrTemplateUseCase({
            ocrTemplateRepo: context.container.get(
                Registry.OcrTemplateTypeOrmRepository
            ),
        })
    });

container_registry.bind( Registry.ChangeActiveOcrTemplateUseCase )
    .toDynamicValue( (context) => {
        return new ChangeActiveOcrTemplateUseCase({
            profilesRepo: context.container.get(
                Registry.ProfileTypeOrmRepository
            ),
            ocrTemplatesRepo: context.container.get(
                Registry.OcrTemplateTypeOrmRepository
            )
        });
    });

container_registry.bind( Registry.ChangeSelectedOcrEngineUseCase )
    .toDynamicValue( (context) => {
        return new ChangeSelectedOcrEngineUseCase({
            profilesRepo: context.container.get(
                Registry.ProfileTypeOrmRepository
            ),
        });
    });

container_registry.bind( Registry.CreateBrowserExtensionUseCase )
    .toDynamicValue( (context) => {
        return new CreateBrowserExtensionUseCase({
            extensionsRepo: context.container.get(
                Registry.BrowserExtensionTypeOrmRepository
            ),
        });
    });

container_registry.bind( Registry.UpdateBrowserExtensionUseCase )
    .toDynamicValue( (context) => {
        return new UpdateBrowserExtensionUseCase({
            extensionsRepo: context.container.get(
                Registry.BrowserExtensionTypeOrmRepository
            ),
        });
    });

container_registry.bind( Registry.GetBrowserExtensionsUseCase )
    .toDynamicValue( (context) => {
        return new GetBrowserExtensionsUseCase({
            extensionsRepo: context.container.get(
                Registry.BrowserExtensionTypeOrmRepository
            ),
        });
    });




export function get_RecognizeImageUseCaseInstance(): RecognizeImageUseCaseInstance {
    return container_registry.get< RecognizeImageUseCaseInstance >( Registry.RecognizeImageUseCaseInstance )
}

export function get_GetSupportedLanguagesUseCaseInstance(): GetSupportedLanguagesUseCaseInstance {    
    return container_registry.get< GetSupportedLanguagesUseCaseInstance >( Registry.GetSupportedLanguagesUseCaseInstance );
}

export function get_GetActiveSettingsPresetUseCase(): GetActiveSettingsPresetUseCase {    
    return container_registry.get< GetActiveSettingsPresetUseCase >( Registry.GetActiveSettingsPresetUseCase );
}

export function get_UpdateSettingsPresetUseCaseInstance(): UpdateSettingsPresetUseCaseInstance {    
    return container_registry.get< UpdateSettingsPresetUseCaseInstance >( Registry.UpdateSettingsPresetUseCaseInstance );
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


export function get_CreateSettingsPresetUseCaseInstance(): CreateSettingsPresetUseCaseInstance {    
    return container_registry.get< CreateSettingsPresetUseCaseInstance >( Registry.CreateSettingsPresetUseCaseInstance );
}


export function get_CreateOcrTemplateUseCase(): CreateOcrTemplateUseCase {    
    return container_registry.get< CreateOcrTemplateUseCase >( Registry.CreateOcrTemplateUseCase );
}

export function get_UpdateOcrTemplateUseCase(): UpdateOcrTemplateUseCase {    
    return container_registry.get< UpdateOcrTemplateUseCase >( Registry.UpdateOcrTemplateUseCase );
}

export function get_GetOcrTemplatesUseCase(): GetOcrTemplatesUseCase {    
    return container_registry.get< GetOcrTemplatesUseCase >( Registry.GetOcrTemplatesUseCase );
}

export function get_DeleteOcrTemplateUseCase(): DeleteOcrTemplateUseCase {    
    return container_registry.get< DeleteOcrTemplateUseCase >( Registry.DeleteOcrTemplateUseCase );
}

export function get_ChangeActiveOcrTemplateUseCase(): ChangeActiveOcrTemplateUseCase {    
    return container_registry.get< ChangeActiveOcrTemplateUseCase >( Registry.ChangeActiveOcrTemplateUseCase );
}

export function get_ChangeSelectedOcrEngineUseCase(): ChangeSelectedOcrEngineUseCase {    
    return container_registry.get< ChangeSelectedOcrEngineUseCase >( Registry.ChangeSelectedOcrEngineUseCase );
}

export function get_CreateBrowserExtensionUseCase(): CreateBrowserExtensionUseCase {    
    return container_registry.get< CreateBrowserExtensionUseCase >( Registry.CreateBrowserExtensionUseCase );
}

export function get_UpdateBrowserExtensionUseCase(): UpdateBrowserExtensionUseCase {    
    return container_registry.get< UpdateBrowserExtensionUseCase >( Registry.UpdateBrowserExtensionUseCase );
}

export function get_GetBrowserExtensionsUseCase(): GetBrowserExtensionsUseCase {    
    return container_registry.get< GetBrowserExtensionsUseCase >( Registry.GetBrowserExtensionsUseCase );
}