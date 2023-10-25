import { get_ChangeActiveOcrLanguageUseCase, get_CheckForAppUpdatesUseCase, get_ExtractTermsFromTextUseCase, get_GetProfileUseCase, get_ImportYomichanDictionaryUseCase, get_SearchDictionaryTermUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { DictionariesController } from "./dictionaries.controller";
import { DictionariesService } from "./dictionaries.service";
import { YomichanImportService } from "./yomichan/yomichan_import.service";



export const yomichanImportService = new YomichanImportService({
    importYomichanDictionaryUseCase: get_ImportYomichanDictionaryUseCase(),    
});

export const dictionariesService = new DictionariesService({
    extractTermsFromTextUseCase: get_ExtractTermsFromTextUseCase(),
    searchDictionaryTermUseCase: get_SearchDictionaryTermUseCase(),
    getProfileUseCase: get_GetProfileUseCase(),
});

export const dictionariesController = new DictionariesController({
    yomichanImportService: yomichanImportService,
    dictionariesService: dictionariesService,
});