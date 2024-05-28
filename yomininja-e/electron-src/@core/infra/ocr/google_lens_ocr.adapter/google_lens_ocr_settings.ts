import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";

// This for preventing import 'electron-is-dev' issues when testing with jest
export const googleLensOcrAdapterName = 'GoogleLensOcrAdapter';


export interface GoogleLensOcrEngineSettings extends OcrEngineSettings {
};

export function getGoogleLensDefaultSettings(): GoogleLensOcrEngineSettings {
    
    const defaultSettings: GoogleLensOcrEngineSettings = {
        ocr_adapter_name: googleLensOcrAdapterName,
        hotkey: 'Alt+G',
        invert_colors: false,
        image_scaling_factor: 1
    }

    return defaultSettings;
}