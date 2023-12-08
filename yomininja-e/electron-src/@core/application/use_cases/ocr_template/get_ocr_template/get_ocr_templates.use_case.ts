import { OcrTemplate, OcrTemplateId, OcrTemplateJson } from "../../../../domain/ocr_template/ocr_template";
import { OcrTemplateRepository } from "../../../../domain/ocr_template/ocr_template.repository";

export interface GetOcrTemplates_Input {
    id?: OcrTemplateId;
    name?: string;
    capture_source_name?: string | null;
};

export class GetOcrTemplatesUseCase {

    public ocrTemplateRepo: OcrTemplateRepository;

    constructor( input: {
        ocrTemplateRepo: OcrTemplateRepository,
    }) {
        this.ocrTemplateRepo = input.ocrTemplateRepo;
    }

    async execute( input: GetOcrTemplates_Input ): Promise< OcrTemplate[] > {

        const { id, name, capture_source_name } = input;

        let templates: OcrTemplate[] = [];

        if ( name || capture_source_name )
            templates  = await this.ocrTemplateRepo.findMany({ name, capture_source_name });

        else if ( id ) {
            const template = await this.ocrTemplateRepo.findOne({ id });

            if ( template )
                templates.push( template );
        }
        else {
            templates = await this.ocrTemplateRepo.getAll();
        }

        return templates;
    }
}