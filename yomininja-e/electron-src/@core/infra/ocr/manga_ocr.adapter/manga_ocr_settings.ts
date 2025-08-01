import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";
// import { applyCpuHotfix } from "./hotfix/hardware_compatibility_hotfix";
import os from 'os';

// For preventing 'electron-is-dev' issues when testing with jest
export const mangaOcrAdapterName = 'MangaOcrAdapter';

export interface MangaOcrEngineSettings extends OcrEngineSettings {
    text_detector: string | 'PaddleTextDetector' | 'ComicTextDetector';
    cpu_threads: number;
    inference_runtime: string; // PyTorch | ONNX
    // det_db_thresh: number; // Only pixels with a score greater than this threshold will be considered as text pixels
    // det_db_box_thresh: number; // When the average score of all pixels is greater than the threshold, the result will be considered as a text area
    // det_db_unclip_ratio: number; // Expansion factor of the Vatti clipping algorithm, which is used to expand the text area
    // det_db_score_mode: 'slow' | 'fast'; // DB detection result score calculation method
    // use_dilation: boolean; // Whether to inflate the segmentation results to obtain better detection results
    // cls_thresh: number; // Prediction threshold, when the model prediction result is 180 degrees, and the score is greater than the threshold, the final prediction result is considered to be 180 degrees and needs to be flipped
};

export function getMangaOcrDefaultSettings() {
    
    const defaultSettings: MangaOcrEngineSettings = {
        ocr_adapter_name: mangaOcrAdapterName,
        hotkey: 'Alt+J',
        image_scaling_factor: 1,
        invert_colors: false,
        text_detector: 'ComicTextDetector',
        cpu_threads: os.cpus().length,
        inference_runtime: 'PyTorch',
        // max_image_width: 1600,
        // det_db_thresh: 0.3,
        // det_db_box_thresh: 0.6,
        // det_db_unclip_ratio: 1.6,
        // det_db_score_mode: "slow",
        // use_dilation: false,
        // cls_thresh: 0.9,
    }

    // const result = applyCpuHotfix( defaultSettings );

    return defaultSettings;
}