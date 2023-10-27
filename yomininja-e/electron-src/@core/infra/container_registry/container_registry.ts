import "reflect-metadata";

import { Container } from "inversify";


export const container_registry = new Container();

export const Registry = {

    // Database
    MainDataSource: Symbol.for('MainDataSource'),
    DictionaryDataSource: Symbol.for('DictionaryDataSource'),

    // Adapters
    PpOcrAdapter: Symbol.for('PpOcrAdapter'),
    SharpImageProcessingAdapter: Symbol.for('SharpImageProcessingAdapter'),
    GithubAppVersionProviderAdapter: Symbol.for('GithubAppVersionProviderAdapter'),
    FakeAppVersionProviderAdapter: Symbol.for('FakeAppVersionProviderAdapter'),
    KuromojiTermExtractor: Symbol.for('KuromojiTermExtractor'),
    JapaneseHelper: Symbol.for('JapaneseHelper'),

    // Use Cases
    RecognizeImageUseCase: Symbol.for('RecognizeImageUseCase'),
    GetSupportedLanguagesUseCase: Symbol.for('GetSupportedLanguagesUseCase'),
    GetActiveSettingsPresetUseCase: Symbol.for('GetActiveSettingsPresetUseCase'),
    UpdateSettingsPresetUseCase: Symbol.for('UpdateSettingsPresetUseCase'),
    CheckForAppUpdatesUseCase: Symbol.for('CheckForAppUpdatesUseCase'),
    ChangeActiveOcrLanguageUseCase: Symbol.for('ChangeActiveOcrLanguageUseCase'),
    GetProfileUseCase: Symbol.for('GetProfileUseCase'),
    ImportYomichanDictionaryUseCase: Symbol.for('ImportYomichanDictionaryUseCase'),
    ExtractTermsFromTextUseCase: Symbol.for('ExtractTermsFromTextUseCase'),
    SearchDictionaryTermUseCase: Symbol.for('SearchDictionaryTermUseCase'),
    ImportFuriganaDictionaryUseCase: Symbol.for('ImportFuriganaDictionaryUseCase'),

    // Repositories
    SettingsPresetInMemoryRepository: Symbol.for('SettingsPresetInMemoryRepository'),
    SettingsPresetTypeOrmRepository: Symbol.for('SettingsPresetTypeOrmRepository'),
    LanguageTypeOrmRepository: Symbol.for('LanguageTypeOrmRepository'),
    ProfileTypeOrmRepository: Symbol.for('ProfileTypeOrmRepository'),
    DictionaryTypeOrmRepository: Symbol.for('DictionaryTypeOrmRepository'),
    DictionaryTagTypeOrmRepository: Symbol.for('DictionaryTagTypeOrmRepository'),
    DictionaryDefinitionTypeOrmRepository: Symbol.for('DictionaryDefinitionTypeOrmRepository'),
    DictionaryHeadwordTypeOrmRepository: Symbol.for('DictionaryHeadwordTypeOrmRepository'),
}

import "./db_registry";
import "./repositories_registry";
import "./adapters_registry";
import "./use_cases_registry";