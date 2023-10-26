import { get_ChangeActiveOcrLanguageUseCase, get_CheckForAppUpdatesUseCase, get_ExtractTermsFromTextUseCase, get_GetProfileUseCase, get_ImportFuriganaDictionaryUseCasee, get_ImportYomichanDictionaryUseCase, get_SearchDictionaryTermUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { JmdictImportService } from "./Jmdict/Jmdict_import.service";
import { DictionariesController } from "./dictionaries.controller";
import { DictionariesService } from "./dictionaries.service";
import { YomichanImportService } from "./yomichan/yomichan_import.service";



const yomichanImportService = new YomichanImportService({
    importYomichanDictionaryUseCase: get_ImportYomichanDictionaryUseCase(),    
});

const jmdictImportService = new JmdictImportService({
    importFuriganaDictionaryUseCase: get_ImportFuriganaDictionaryUseCasee(),
});

const dictionariesService = new DictionariesService({
    extractTermsFromTextUseCase: get_ExtractTermsFromTextUseCase(),
    searchDictionaryTermUseCase: get_SearchDictionaryTermUseCase(),
    getProfileUseCase: get_GetProfileUseCase(),
});

export const dictionariesController = new DictionariesController({
    yomichanImportService,
    dictionariesService,
    jmdictImportService
});