import { get_ChangeActiveOcrLanguageUseCase, get_CheckForAppUpdatesUseCase, get_GetProfileUseCase, get_ImportYomichanDictionaryUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { DictionariesController } from "./dictionaries.controller";
import { YomichanImportService } from "./yomichan/yomichan_import.service";



export const yomichanImportService = new YomichanImportService({
    importYomichanDictionaryUseCase: get_ImportYomichanDictionaryUseCase(),    
});

export const dictionariesController = new DictionariesController({
    yomichanImportService: yomichanImportService,
});