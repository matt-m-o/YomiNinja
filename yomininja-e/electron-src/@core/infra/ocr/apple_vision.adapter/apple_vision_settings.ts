import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";
// import { applyCpuHotfix } from "./hotfix/hardware_compatibility_hotfix";

// For preventing 'electron-is-dev' issues when testing with jest
export const appleVisionAdapterName = 'AppleVisionAdapter';

export interface AppleVisionOcrEngineSettings extends OcrEngineSettings {};

export function getAppleVisionDefaultSettings() {
    
    const defaultSettings: AppleVisionOcrEngineSettings = {
        ocr_adapter_name: appleVisionAdapterName,
        hotkey: 'Alt+A',
        image_scaling_factor: 1,
        invert_colors: false,
    }

    return defaultSettings;
}