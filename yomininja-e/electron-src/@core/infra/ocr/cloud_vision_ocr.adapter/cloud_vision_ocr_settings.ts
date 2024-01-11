import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";

// This for preventing import 'electron-is-dev' issues when testing with jest
export const cloudVisionOcrAdapterName = 'CloudVisionOcrAdapter';

export interface CloudVisionOcrEngineSettings extends OcrEngineSettings {
    api_key?: string;
    token?: string;
    monthly_request_limit: number;
};

export function getCloudVisionDefaultSettings(): CloudVisionOcrEngineSettings {
    
    const defaultSettings: CloudVisionOcrEngineSettings = {
        ocr_adapter_name: cloudVisionOcrAdapterName,
        hotkey: 'Alt+G',
        monthly_request_limit: 900,
        image_scaling_factor: 1,
        invert_colors: false
    }

    return defaultSettings;
}