import { OcrEngineSettings } from "../../domain/settings_preset/settings_preset";
import { applyCpuHotfix } from "./hotfix/hardware_compatibility_hotfix";
import os from 'os';

// This for preventing import 'electron-is-dev' issues when testing with jest
export const ppOcrAdapterName = 'PpOcrAdapter';

export interface PpOcrEngineSettings extends OcrEngineSettings {
    max_image_width: number;
    cpu_threads: number;
    inference_runtime: string;
};

export function getPpOcrDefaultSettings() {
    
    const defaultSettings: PpOcrEngineSettings = {
        ocr_adapter_name: ppOcrAdapterName,
        image_scaling_factor: 1,
        max_image_width: 1600,
        cpu_threads: os.cpus().length,
        invert_colors: false,
        inference_runtime: 'Open_VINO'
    }

    const result = applyCpuHotfix( defaultSettings );

    return result.ocrEngineSettings;
}
