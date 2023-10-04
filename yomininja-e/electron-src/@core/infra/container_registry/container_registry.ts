import "reflect-metadata";

import { Container } from "inversify";


export const container_registry = new Container();

export const Registry = {

    // Database
    MainDataSource: Symbol.for('MainDataSource'),

    // Adapters
    PpOcrAdapter: Symbol.for('PpOcrAdapter'),
    SharpImageProcessingAdapter: Symbol.for('SharpImageProcessingAdapter'),
    GithubAppVersionProviderAdapter: Symbol.for('GithubAppVersionProviderAdapter'),
    FakeAppVersionProviderAdapter: Symbol.for('FakeAppVersionProviderAdapter'),

    // Use Cases
    RecognizeImageUseCase: Symbol.for('RecognizeImageUseCase'),
    GetSupportedLanguagesUseCase: Symbol.for('GetSupportedLanguagesUseCase'),
    GetActiveSettingsPresetUseCase: Symbol.for('GetActiveSettingsPresetUseCase'),
    UpdateSettingsPresetUseCase: Symbol.for('UpdateSettingsPresetUseCase'),
    CheckForAppUpdatesUseCase: Symbol.for('CheckForAppUpdatesUseCase'),
    ChangeActiveOcrLanguageUseCase: Symbol.for('ChangeActiveOcrLanguageUseCase'),

    // Repositories
    SettingsPresetInMemoryRepository: Symbol.for('SettingsPresetInMemoryRepository'),
    SettingsPresetTypeOrmRepository: Symbol.for('SettingsPresetTypeOrmRepository'),
    LanguageTypeOrmRepository: Symbol.for('LanguageTypeOrmRepository'),
    ProfileTypeOrmRepository: Symbol.for('ProfileTypeOrmRepository'),
}

import "./db_registry";
import "./repositories_registry";
import "./adapters_registry";
import "./use_cases_registry";
