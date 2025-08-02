import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";

// This for preventing import 'electron-is-dev' issues when testing with jest
export const googleLensOcrAdapterName = 'GoogleLensOcrAdapter';


export interface GoogleLensOcrEngineSettings extends OcrEngineSettings {
    api_key?: string;
    max_image_area?: number;
    max_image_dimension?: number;
};

export function getGoogleLensDefaultSettings(): GoogleLensOcrEngineSettings {
    
    const defaultSettings: GoogleLensOcrEngineSettings = {
        ocr_adapter_name: googleLensOcrAdapterName,
        hotkey: 'Alt+G',
        invert_colors: false,
        image_scaling_factor: 1,
        api_key: 'AIzaSyA2KlwBX3mkFo30om9LUFYQhpqLoa_BNhE',
        max_image_area: 1_000_000,
        max_image_dimension: 1000,
    }

    return defaultSettings;
}