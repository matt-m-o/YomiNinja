import { get_GetActiveSettingsPresetUseCase, get_GetSupportedLanguagesUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { OverlayController } from "./overlay.controller";
import { OverlayService } from "./overlay.service";


const overlayService = new OverlayService({    
    getActiveSettingsPresetUseCase: get_GetActiveSettingsPresetUseCase(),    
});

export const overlayController = new OverlayController({
    overlayService,    
});