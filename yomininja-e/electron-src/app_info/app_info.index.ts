import { get_CheckForAppUpdatesUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { AppInfoController } from "./app_info.controller";
import { AppInfoService } from "./app_info.service";


const appInfoService = new AppInfoService({
    checkForAppUpdatesUseCase: get_CheckForAppUpdatesUseCase()
});

export const ocrRecognitionController = new AppInfoController({
    appInfoService,
});