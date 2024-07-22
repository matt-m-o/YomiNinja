import "reflect-metadata";

import { Container } from "inversify";


export const container_registry = new Container();

export const Registry = {

    // Database
    MainDataSource: Symbol.for('MainDataSource'),
    DictionaryDataSource: Symbol.for('DictionaryDataSource'),

    // Adapters
    PpOcrAdapter: Symbol.for('PpOcrAdapter'),
    CloudVisionOcrAdapter: Symbol.for('CloudVisionOcrAdapter'),
    GoogleLensOcrAdapter: Symbol.for('GoogleLensOcrAdapter'),
    MangaOcrAdapter: Symbol.for('MangaOcrAdapter'),
    AppleVisionAdapter: Symbol.for('AppleVisionAdapter'),
    SharpImageProcessingAdapter: Symbol.for('SharpImageProcessingAdapter'),
    GithubAppVersionProviderAdapter: Symbol.for('GithubAppVersionProviderAdapter'),
    FakeAppVersionProviderAdapter: Symbol.for('FakeAppVersionProviderAdapter'),
    KuromojiTermExtractor: Symbol.for('KuromojiTermExtractor'),
    JapaneseHelper: Symbol.for('JapaneseHelper'),

    // Use Cases
    RecognizeImageUseCaseInstance: Symbol.for('RecognizeImageUseCaseInstance'),
    GetSupportedLanguagesUseCaseInstance: Symbol.for('GetSupportedLanguagesUseCaseInstance'),
    GetActiveSettingsPresetUseCase: Symbol.for('GetActiveSettingsPresetUseCase'),
    UpdateSettingsPresetUseCaseInstance: Symbol.for('UpdateSettingsPresetUseCaseInstance'),
    CheckForAppUpdatesUseCase: Symbol.for('CheckForAppUpdatesUseCase'),
    ChangeActiveOcrLanguageUseCase: Symbol.for('ChangeActiveOcrLanguageUseCase'),
    GetProfileUseCase: Symbol.for('GetProfileUseCase'),
    ImportYomichanDictionaryUseCase: Symbol.for('ImportYomichanDictionaryUseCase'),
    ExtractTermsFromTextUseCase: Symbol.for('ExtractTermsFromTextUseCase'),
    SearchDictionaryTermUseCase: Symbol.for('SearchDictionaryTermUseCase'),
    ImportFuriganaDictionaryUseCase: Symbol.for('ImportFuriganaDictionaryUseCase'),
    GetDictionariesUseCase: Symbol.for('GetDictionariesUseCase'),
    DeleteAllDictionariesUseCase: Symbol.for('DeleteAllDictionariesUseCase'),
    CreateSettingsPresetUseCaseInstance: Symbol.for('CreateSettingsPresetUseCaseInstance'),
    CreateOcrTemplateUseCase: Symbol.for('CreateOcrTemplateUseCase'),
    UpdateOcrTemplateUseCase: Symbol.for('UpdateOcrTemplateUseCase'),
    GetOcrTemplatesUseCase: Symbol.for('GetOcrTemplatesUseCase'),
    DeleteOcrTemplateUseCase: Symbol.for('DeleteOcrTemplatesUseCase'),
    ChangeActiveOcrTemplateUseCase: Symbol.for('ChangeActiveOcrTemplateUseCase'),
    ChangeSelectedOcrEngineUseCase: Symbol.for('ChangeSelectedOcrEngineUseCase'),
    CreateBrowserExtensionUseCase: Symbol.for('CreateBrowserExtensionUseCase'),
    UpdateBrowserExtensionUseCase: Symbol.for('UpdateBrowserExtensionUseCase'),
    GetBrowserExtensionsUseCase: Symbol.for('GetBrowserExtensionsUseCase'),

    // Repositories
    SettingsPresetInMemoryRepository: Symbol.for('SettingsPresetInMemoryRepository'),
    SettingsPresetTypeOrmRepository: Symbol.for('SettingsPresetTypeOrmRepository'),
    LanguageTypeOrmRepository: Symbol.for('LanguageTypeOrmRepository'),
    ProfileTypeOrmRepository: Symbol.for('ProfileTypeOrmRepository'),
    DictionaryTypeOrmRepository: Symbol.for('DictionaryTypeOrmRepository'),
    DictionaryTagTypeOrmRepository: Symbol.for('DictionaryTagTypeOrmRepository'),
    DictionaryDefinitionTypeOrmRepository: Symbol.for('DictionaryDefinitionTypeOrmRepository'),
    DictionaryHeadwordTypeOrmRepository: Symbol.for('DictionaryHeadwordTypeOrmRepository'),
    OcrTemplateTypeOrmRepository: Symbol.for('OcrTemplateTypeOrmRepository'),
    OcrTargetRegionTypeOrmRepository: Symbol.for('OcrTargetRegionTypeOrmRepository'),
    BrowserExtensionTypeOrmRepository: Symbol.for('BrowserExtensionTypeOrmRepository')
}

import "./db_registry";
import "./repositories_registry";
import "./adapters_registry";
import "./use_cases_registry";