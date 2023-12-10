import { OcrTemplate, OcrTemplateId } from "./ocr_template";


export type OcrTemplateFindOneInput = {
    id?: OcrTemplateId;
    name?: string;
    capture_source_name?: string;
}

export type OcrTemplateFindManyInput = {        
    name?: string;
    capture_source_name?: string | null;
}

export interface OcrTemplateRepository {

    insert( ocrTemplate: OcrTemplate ): Promise< void >;

    update( ocrTemplate: OcrTemplate ): Promise< void >;

    findOne( input: OcrTemplateFindOneInput ): Promise< OcrTemplate | null >;

    findMany( input: OcrTemplateFindManyInput ): Promise< OcrTemplate[] >;

    getAll(): Promise< OcrTemplate[] >;

    delete( id: OcrTemplateId ): Promise< void >;
}