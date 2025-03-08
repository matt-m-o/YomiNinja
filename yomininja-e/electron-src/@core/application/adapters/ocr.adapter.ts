import { Language } from "../../domain/language/language";
import { OcrResult } from "../../domain/ocr_result/ocr_result";
import { OcrResultScalable } from "../../domain/ocr_result_scalable/ocr_result_scalable";
import { OcrEngineSettings } from "../../domain/settings_preset/settings_preset";

export type OcrRecognitionInput = {
    imageBuffer: Buffer;
    language: Language; // Two letters
    detectionOnly?: boolean;
};

export type RecognizeSelectionInput = {
    partialOcrResult: OcrResultScalable;
    selectedItemIds: string[];
};

export interface OcrEngineSettingsOptions {
    inference_runtime: {
        value: string,
        displayName: string;
    }[]
}

export type UpdateOcrAdapterSettingsOutput< TSettings extends OcrEngineSettings = OcrEngineSettings > = {
    settings: TSettings;
    restart: boolean;
};

export type TextRecognitionModel = {
    name: string;
    languageCodes: string[];
    isInstalled: boolean;
};

export type HardwareAccelerationOption = {
    osPlatform: NodeJS.Platform;
    backend: string; //'Torch',
    computePlatform: string; //'CPU' | 'CUDA' | 'ROCm' | 'Default';
    computePlatformVersion?: string;
    installCommand: string;
    installed: boolean;
}

export interface OcrAdapter< TSettings extends OcrEngineSettings = OcrEngineSettings > {     
    name: string;
    status: OcrAdapterStatus;
    recognize: ( input: OcrRecognitionInput ) => Promise< OcrResultScalable | null >;
    recognizeSelection?: ( input: RecognizeSelectionInput ) => Promise< OcrResultScalable | null >;
    getSupportedLanguages: () => Promise< string[] >; // Get this by calling the grpc stub or reading it's config files
    getSupportedModels: () => Promise< TextRecognitionModel[] >; // Get this by calling the grpc stub or reading it's config files
    installModel?: ( modelName: string ) => Promise< boolean >;
    getHardwareAccelerationOptions?: () => Promise< HardwareAccelerationOption[] >;
    installHardwareAcceleration?: ( option: HardwareAccelerationOption ) => Promise< boolean >;
    updateSettings: ( settingsUpdate: TSettings, oldSettings?: TSettings ) => Promise< UpdateOcrAdapterSettingsOutput< TSettings > >;
    getDefaultSettings: () => TSettings;
    getSettingsOptions: () => OcrEngineSettingsOptions;
    restart: ( callback: () => void ) => void;
}

export enum OcrAdapterStatus {
    Enabled = "Enabled",
    Disabled = "Disabled",
    Starting = "Starting",
    Restarting = "Restarting",
    Processing = "Processing",
}