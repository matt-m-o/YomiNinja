import { get_CloudVisionOcrAdapter, get_GoogleLensOcrAdapter, get_MangaOcrAdapter, get_PpOcrAdapter } from "../@core/infra/container_registry/adapters_registry";
import { get_ChangeActiveOcrLanguageUseCase, get_GetActiveSettingsPresetUseCase, get_GetSupportedLanguagesUseCaseInstance, get_RecognizeImageUseCaseInstance } from "../@core/infra/container_registry/use_cases_registry";
import { OcrEngineSettingsU } from "../@core/infra/types/entity_instance.types";
import { OcrRecognitionController } from "./ocr_recognition.controller";
import { OcrRecognitionService } from "./ocr_recognition.service";

const ocrAdapters = [
    get_PpOcrAdapter(),
    get_CloudVisionOcrAdapter(),
    get_GoogleLensOcrAdapter(),
    get_MangaOcrAdapter(),
];

const ocrRecognitionService = new OcrRecognitionService< OcrEngineSettingsU | any >({
    recognizeImageUseCase: get_RecognizeImageUseCaseInstance(),
    getSupportedLanguagesUseCase: get_GetSupportedLanguagesUseCaseInstance(),
    getActiveSettingsPresetUseCase: get_GetActiveSettingsPresetUseCase(),
    ocrAdapters
});

export const ocrRecognitionController = new OcrRecognitionController({
    ocrRecognitionService,    
});