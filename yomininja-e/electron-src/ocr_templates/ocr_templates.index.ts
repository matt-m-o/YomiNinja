import { get_ChangeActiveOcrTemplateUseCase, get_CreateOcrTemplateUseCase, get_DeleteOcrTemplateUseCase, get_GetOcrTemplatesUseCase, get_GetProfileUseCase, get_UpdateOcrTemplateUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { OcrTemplatesController } from "./ocr_templates.controller";
import { OcrTemplatesEvents } from "./ocr_templates.events";
import { OcrTemplatesService } from "./ocr_templates.service";


const createOcrTemplateUseCase = get_CreateOcrTemplateUseCase();
const updateOcrTemplateUseCase = get_UpdateOcrTemplateUseCase();
const getOcrTemplatesUseCase = get_GetOcrTemplatesUseCase();
const deleteOcrTemplateUseCase = get_DeleteOcrTemplateUseCase();
const changeActiveOcrTemplateUseCase = get_ChangeActiveOcrTemplateUseCase();
const getProfileUseCase = get_GetProfileUseCase();


export const ocrTemplatesService = new OcrTemplatesService({
    createOcrTemplateUseCase,
    updateOcrTemplateUseCase,
    getOcrTemplatesUseCase,
    deleteOcrTemplateUseCase,
    getProfileUseCase,
    changeActiveOcrTemplateUseCase
});


export const ocrTemplatesController = new OcrTemplatesController({
    ocrTemplatesService
});

export const ocrTemplateEvents: OcrTemplatesEvents = new OcrTemplatesEvents();