import { OcrTemplate } from "./ocr_template";


export type OcrTemplateFindOneInput = {
    id?: string;
    name?: string;
}

export interface OcrTemplateRepository {

    insert( ocrTemplate: OcrTemplate ): Promise< void >;

    update( ocrTemplate: OcrTemplate ): Promise< void >;

    findOne( input: OcrTemplateFindOneInput ): Promise< OcrTemplate | null >;

    getAll(): Promise< OcrTemplate[] >;

    delete( id: string ): Promise< void >;
}