import { EntitySchema } from 'typeorm';
import { generateIndexName } from '../common/schema_helpers';
import { OcrTemplate } from '../../../../domain/ocr_template/ocr_template';


const name = 'ocr_template';
export const OcrTemplateTypeOrmSchema = new EntitySchema< OcrTemplate >({

    name,
    target: OcrTemplate,

    columns: {

        id: {
            type: Number,
            primary: true,
            generated: 'increment'
        },
        
        name: {
            type: String,
            length: 100,
            unique: true,
        },

        image: {
            type: 'blob',
        },

        capture_source_name: {
            type: String,
            length: 100,
            nullable: true
        },

        capturer_options: {
            type: 'json',
            nullable: true
        },

        created_at: {
            type: 'datetime',
        },

        updated_at: {
            type: 'datetime',
            updateDate: true,
        },
    },

    relations:{
        target_regions: {
            type: 'one-to-many',
            target: 'OcrTargetRegion',
            inverseSide: 'ocr_template',
            cascade: false,
            default: [],
            eager: true
        },
    },
})