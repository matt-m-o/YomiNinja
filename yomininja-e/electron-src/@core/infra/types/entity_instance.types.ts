import { SettingsPreset, SettingsPresetProps } from "../../domain/settings_preset/settings_preset";
import { PpOcrEngineSettings } from "../ocr/ppocr.adapter/ppocr_settings";

// Ocr engine settings union type
export type OcrEngineSettingsU = PpOcrEngineSettings;

export type SettingsPresetInstanceProps = SettingsPresetProps< OcrEngineSettingsU >;

export type SettingsPresetInstance = SettingsPreset< SettingsPresetInstanceProps >;