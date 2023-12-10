import { CreateOcrTemplateUseCase, CreateOcrTemplate_Input } from "../@core/application/use_cases/ocr_template/create_ocr_template/create_ocr_template.use_case";
import { DeleteOcrTemplateUseCase } from "../@core/application/use_cases/ocr_template/delete_ocr_template/delete_ocr_template.use_case";
import { GetOcrTemplatesUseCase, GetOcrTemplates_Input } from "../@core/application/use_cases/ocr_template/get_ocr_template/get_ocr_templates.use_case";
import { UpdateOcrTemplateUseCase, UpdateOcrTemplate_Input } from "../@core/application/use_cases/ocr_template/update_ocr_template/update_ocr_template.use_case";
import { OcrTemplate, OcrTemplateId, OcrTemplateJson } from "../@core/domain/ocr_template/ocr_template";



export class OcrTemplatesService {

    createOcrTemplateUseCase: CreateOcrTemplateUseCase;
    updateOcrTemplateUseCase: UpdateOcrTemplateUseCase;
    getOcrTemplatesUseCase: GetOcrTemplatesUseCase;
    deleteOcrTemplateUseCase: DeleteOcrTemplateUseCase;

    constructor(
        input: {
            createOcrTemplateUseCase: CreateOcrTemplateUseCase,
            updateOcrTemplateUseCase: UpdateOcrTemplateUseCase,
            getOcrTemplatesUseCase: GetOcrTemplatesUseCase,
            deleteOcrTemplateUseCase: DeleteOcrTemplateUseCase,
        }
    ) {
        this.createOcrTemplateUseCase = input.createOcrTemplateUseCase;
        this.updateOcrTemplateUseCase = input.updateOcrTemplateUseCase;
        this.getOcrTemplatesUseCase = input.getOcrTemplatesUseCase;
        this.deleteOcrTemplateUseCase = input.deleteOcrTemplateUseCase;
    }

    async createOcrTemplate( templateData: OcrTemplateJson ): Promise< OcrTemplate > {

        return await this.createOcrTemplateUseCase.execute( templateData );
    }

    async updateOcrTemplate( templateData: OcrTemplateJson ): Promise< OcrTemplate | undefined > {

        return await this.updateOcrTemplateUseCase.execute( templateData );
    }

    async getOcrTemplates( input: GetOcrTemplates_Input ): Promise< OcrTemplate[] > {

        return await this.getOcrTemplatesUseCase.execute( input );
    }

    async deleteOcrTemplate( id: OcrTemplateId ): Promise< void > {

        await this.deleteOcrTemplateUseCase.execute({ id });
    }
}