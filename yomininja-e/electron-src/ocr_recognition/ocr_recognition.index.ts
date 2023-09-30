import { get_GetActiveSettingsPresetUseCase, get_GetSupportedLanguagesUseCase, get_RecognizeImageUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { OcrRecognitionController } from "./ocr_recognition.controller";
import { OcrRecognitionService } from "./ocr_recognition.service";


const ocrRecognitionService = new OcrRecognitionService({
    recognizeImageUseCase: get_RecognizeImageUseCase(),
    getSupportedLanguagesUseCase: get_GetSupportedLanguagesUseCase(),
    getActiveSettingsPresetUseCase: get_GetActiveSettingsPresetUseCase(),
});

export const ocrRecognitionController = new OcrRecognitionController({
    ocrRecognitionService,    
});