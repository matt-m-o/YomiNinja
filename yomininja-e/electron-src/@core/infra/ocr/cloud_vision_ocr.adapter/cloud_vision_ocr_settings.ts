import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";

// This for preventing import 'electron-is-dev' issues when testing with jest
export const cloudVisionOcrAdapterName = 'CloudVisionOcrAdapter';

export interface CloudVisionOcrEngineSettings extends OcrEngineSettings {
    api_key?: string;
    token?: string;
    monthly_request_limit: number; //
    monthly_request_count: number;
    monthly_reset_day: number; // 1 - 30
    last_reset_date: Date;
};

export function getCloudVisionDefaultSettings(): CloudVisionOcrEngineSettings {
    
    const defaultSettings: CloudVisionOcrEngineSettings = {
        ocr_adapter_name: cloudVisionOcrAdapterName,
        hotkey: 'Alt+G',
        invert_colors: false,
        image_scaling_factor: 1,
        monthly_request_limit: 500,
        monthly_request_count: 0,
        monthly_reset_day: 1,
        last_reset_date: new Date()
    }

    return defaultSettings;
}