import { get_GetActiveSettingsPresetUseCase, get_UpdateSettingsPresetUseCaseInstance } from "../@core/infra/container_registry/use_cases_registry";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";


const settingsService = new SettingsService({
    getActiveSettingsPresetUseCase: get_GetActiveSettingsPresetUseCase(),
    updateSettingsPresetUseCase: get_UpdateSettingsPresetUseCaseInstance(),
});

export const settingsController = new SettingsController({
    settingsService,    
});