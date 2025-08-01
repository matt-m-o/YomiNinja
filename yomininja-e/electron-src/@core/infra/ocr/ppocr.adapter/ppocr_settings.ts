import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";
import { applyCpuHotfix } from "./hotfix/hardware_compatibility_hotfix";
import os from 'os';

// This for preventing import 'electron-is-dev' issues when testing with jest
export const ppOcrAdapterName = 'PpOcrAdapter';

export interface PpOcrEngineSettings extends OcrEngineSettings {
    max_image_width: number;
    cpu_threads: number;
    inference_runtime: string;
    det_db_thresh: number; // Only pixels with a score greater than this threshold will be considered as text pixels
    det_db_box_thresh: number; // When the average score of all pixels is greater than the threshold, the result will be considered as a text area
    det_db_unclip_ratio: number; // Expansion factor of the Vatti clipping algorithm, which is used to expand the text area
    det_db_score_mode: 'slow' | 'fast'; // DB detection result score calculation method
    use_dilation: boolean; // Whether to inflate the segmentation results to obtain better detection results
    cls_thresh: number; // Prediction threshold, when the model prediction result is 180 degrees, and the score is greater than the threshold, the final prediction result is considered to be 180 degrees and needs to be flipped
};

export function getPpOcrDefaultSettings() {
    
    const defaultSettings: PpOcrEngineSettings = {
        ocr_adapter_name: ppOcrAdapterName,
        hotkey: 'Alt+D',
        image_scaling_factor: 1,
        max_image_width: 1600,
        cpu_threads: os.cpus().length,
        invert_colors: false,
        inference_runtime: 'ONNX_CPU', // Open_VINO | ONNX_CPU
        det_db_thresh: 0.3,
        det_db_box_thresh: 0.6,
        det_db_unclip_ratio: 1.6,
        det_db_score_mode: "slow",
        use_dilation: false,
        cls_thresh: 0.9,
    }

    const result = applyCpuHotfix( defaultSettings );

    return result.ocrEngineSettings;
}