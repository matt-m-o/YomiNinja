import { get_GetActiveSettingsPresetUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";



export const appService = new AppService({
    getActiveSettingsPresetUseCase: get_GetActiveSettingsPresetUseCase()
});

export const appController = new AppController({
    appService,
});