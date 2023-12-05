import { OcrTemplate, OcrTemplateId } from "./ocr_template";


export type OcrTemplateFindOneInput = {
    id?: OcrTemplateId;
    name?: string;
    capture_source_name?: string;
}

export interface OcrTemplateRepository {

    insert( ocrTemplate: OcrTemplate ): Promise< void >;

    update( ocrTemplate: OcrTemplate ): Promise< void >;

    findOne( input: OcrTemplateFindOneInput ): Promise< OcrTemplate | null >;

    getAll(): Promise< OcrTemplate[] >;

    delete( id: string ): Promise< void >;
}