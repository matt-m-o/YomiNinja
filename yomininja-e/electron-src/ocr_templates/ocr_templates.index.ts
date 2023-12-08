import { get_CreateOcrTemplateUseCase, get_DeleteOcrTemplateUseCase, get_GetOcrTemplatesUseCase, get_UpdateOcrTemplateUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { OcrTemplatesController } from "./ocr_templates.controller";
import { OcrTemplatesService } from "./ocr_templates.service";


const createOcrTemplateUseCase = get_CreateOcrTemplateUseCase();
const updateOcrTemplateUseCase = get_UpdateOcrTemplateUseCase();
const getOcrTemplatesUseCase = get_GetOcrTemplatesUseCase();
const deleteOcrTemplateUseCase = get_DeleteOcrTemplateUseCase();


export const ocrTemplatesService = new OcrTemplatesService({
    createOcrTemplateUseCase,
    updateOcrTemplateUseCase,
    getOcrTemplatesUseCase,
    deleteOcrTemplateUseCase
});


export const ocrTemplatesController = new OcrTemplatesController({
    ocrTemplatesService
});