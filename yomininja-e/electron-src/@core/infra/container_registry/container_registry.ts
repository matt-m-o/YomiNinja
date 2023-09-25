import "reflect-metadata";

import { Container } from "inversify";


export const container_registry = new Container();

export const Registry = {

    // Database
    MainDataSource: Symbol.for('MainDataSource'),

    // Adapters
    PpOcrAdapter: Symbol.for('PpOcrAdapter'),

    // Use Cases
    RecognizeImageUseCase: Symbol.for('RecognizeImageUseCase'),
    GetSupportedLanguagesUseCase: Symbol.for('GetSupportedLanguagesUseCase'),

    // Repositories
    SettingsPresetInMemoryRepository: Symbol.for('SettingsPresetInMemoryRepository'),
    SettingsPresetTypeOrmRepository: Symbol.for('SettingsPresetTypeOrmRepository'),
}

import "./db_registry";
import "./repositories_registry";
import "./adapters_registry";
import "./use_cases_registry";
