import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { GetSupportedLanguagesUseCase } from "../../application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { RecognizeImageUseCase } from "../../application/use_cases/recognize_image/recognize_image.use_case";
import { get_SettingsPresetRepository } from "./repositories_registry";
import { GetActiveSettingsPresetUseCase } from "../../application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { UpdateSettingsPresetUseCase } from "../../application/use_cases/update_settings_preset/update_settings_preset.use_case";
import { CheckForAppUpdatesUseCase } from "../../application/use_cases/check_for_app_updates/check_for_app_updates.use_case";


container_registry.bind( Registry.RecognizeImageUseCase ).toDynamicValue( (context) => {
    return new RecognizeImageUseCase(
        [
            context.container.get( Registry.PpOcrAdapter ),
        ],
        context.container.get( Registry.SharpImageProcessingAdapter ),
        context.container.get( Registry.ProfileTypeOrmRepository ),
    );
}).inSingletonScope();

container_registry.bind( Registry.GetSupportedLanguagesUseCase ).toDynamicValue( (context) => {
    return new GetSupportedLanguagesUseCase( [
        context.container.get( Registry.PpOcrAdapter ),
    ]);
}).inSingletonScope();


container_registry.bind( Registry.GetActiveSettingsPresetUseCase ).toDynamicValue( (context) => {
    return new GetActiveSettingsPresetUseCase(
        context.container.get( Registry.ProfileTypeOrmRepository ),
    );
}).inSingletonScope();

container_registry.bind( Registry.UpdateSettingsPresetUseCase ).toDynamicValue( (context) => {
    return new UpdateSettingsPresetUseCase(
        context.container.get( Registry.SettingsPresetTypeOrmRepository ),
        context.container.get( Registry.PpOcrAdapter ),
    );
}).inSingletonScope();

container_registry.bind( Registry.CheckForAppUpdatesUseCase ).toDynamicValue( (context) => {
    return new CheckForAppUpdatesUseCase(
        context.container.get( Registry.FakeAppVersionProviderAdapter ),
    );
}).inSingletonScope();



export function get_RecognizeImageUseCase(): RecognizeImageUseCase {
    return container_registry.get< RecognizeImageUseCase >( Registry.RecognizeImageUseCase )
}

export function get_GetSupportedLanguagesUseCase(): GetSupportedLanguagesUseCase {    
    return container_registry.get< GetSupportedLanguagesUseCase >( Registry.GetSupportedLanguagesUseCase );
}

export function get_GetActiveSettingsPresetUseCase(): GetActiveSettingsPresetUseCase {    
    return container_registry.get< GetActiveSettingsPresetUseCase >( Registry.GetActiveSettingsPresetUseCase );
}

export function get_UpdateSettingsPresetUseCase(): UpdateSettingsPresetUseCase {    
    return container_registry.get< UpdateSettingsPresetUseCase >( Registry.UpdateSettingsPresetUseCase );
}

export function get_CheckForAppUpdatesUseCase(): CheckForAppUpdatesUseCase {    
    return container_registry.get< CheckForAppUpdatesUseCase >( Registry.CheckForAppUpdatesUseCase );
}