import { CreateSettingsPresetUseCase } from "../../application/use_cases/create_settings_preset/create_settings_preset.use_case";
import { GetSupportedLanguagesUseCase } from "../../application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { RecognizeImageUseCase } from "../../application/use_cases/recognize_image/recognize_image.use_case";
import { UpdateSettingsPresetUseCase } from "../../application/use_cases/update_settings_preset/update_settings_preset.use_case";
import { OcrEngineSettingsU } from "./entity_instance.types";


export type CreateSettingsPresetUseCaseInstance = CreateSettingsPresetUseCase< OcrEngineSettingsU >;

export type UpdateSettingsPresetUseCaseInstance = UpdateSettingsPresetUseCase< OcrEngineSettingsU >;

export type RecognizeImageUseCaseInstance = RecognizeImageUseCase< OcrEngineSettingsU >;

export type GetSupportedLanguagesUseCaseInstance = GetSupportedLanguagesUseCase< OcrEngineSettingsU >;