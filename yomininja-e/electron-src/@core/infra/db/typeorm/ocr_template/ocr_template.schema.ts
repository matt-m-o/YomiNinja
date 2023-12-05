import { EntitySchema } from 'typeorm';
import { generateIndexName } from '../common/schema_helpers';
import { OcrTemplate } from '../../../../domain/ocr_template/ocr_template';


const name = 'ocr_template';
export const OcrTemplateTypeOrmSchema = new EntitySchema< OcrTemplate >({

    name,
    target: OcrTemplate,

    columns: {

        id: {
            type: String,
            length: 100,
            primary: true,
        },
        
        name: {
            type: String,
            length: 100,
            unique: true,
        },

        image: {
            type: 'blob',
        },

        target_regions: {
            type: 'json',
        },

        capture_source_name: {
            type: String,
            length: 100,
            nullable: true
        },

        created_at: {
            type: 'datetime',
        },

        updated_at: {
            type: 'datetime',
            updateDate: true,
        },       
    }
})