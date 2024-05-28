import { get_ChangeActiveOcrLanguageUseCase, get_ChangeSelectedOcrEngineUseCase, get_CheckForAppUpdatesUseCase, get_GetProfileUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";


const profileService = new ProfileService({
    getProfileUseCase: get_GetProfileUseCase(),
    changeActiveOcrLanguageUseCase: get_ChangeActiveOcrLanguageUseCase(),
    changeSelectedOcrEngineUseCase: get_ChangeSelectedOcrEngineUseCase()
});

export const profileController = new ProfileController({
    profileService
});