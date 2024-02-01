import { OcrTemplate, OcrTemplateId, OcrTemplateJson } from "../../../../domain/ocr_template/ocr_template";
import { OcrTemplateRepository } from "../../../../domain/ocr_template/ocr_template.repository";

export interface DeleteOcrTemplate_Input {
    id: OcrTemplateId;
};

export class DeleteOcrTemplateUseCase {

    public ocrTemplateRepo: OcrTemplateRepository;

    constructor( input: {
        ocrTemplateRepo: OcrTemplateRepository,
    }) {
        this.ocrTemplateRepo = input.ocrTemplateRepo;
    }

    async execute( input: DeleteOcrTemplate_Input ): Promise< void > {

        await this.ocrTemplateRepo.delete( input.id );
    }
}