import { get_ChangeActiveOcrLanguageUseCase, get_CheckForAppUpdatesUseCase, get_GetProfileUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";


const profileService = new ProfileService({
    changeActiveOcrLanguageUseCase: get_ChangeActiveOcrLanguageUseCase(),
    getProfileUseCase: get_GetProfileUseCase(),
});

export const profileController = new ProfileController({
    profileService,
});