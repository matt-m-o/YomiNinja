import { EntitySchema } from 'typeorm';
import { OcrTargetRegion } from '../../../../../domain/ocr_template/ocr_target_region/ocr_target_region';


const name = 'ocr_target_region';
export const OcrTargetRegionTypeOrmSchema = new EntitySchema< OcrTargetRegion >({

    name,
    target: OcrTargetRegion,

    columns: {

        id: {
            type: String,
            length: 100,
            primary: true,
        },

        ocr_template_id: {
            type: String,
            length: 100,
        },
        
        position: {
            type: 'json'
        },

        size: {
            type: 'json',
        },

        angle: {
            type: Number,
            default: 0,
        },

        created_at: {
            type: 'datetime',
        },

        updated_at: {
            type: 'datetime',
            updateDate: true,
        },       
    },

    relations: {
        ocr_template: {
            type: 'many-to-one',
            target: 'OcrTemplate',
            joinColumn: {
                name: 'ocr_template_id',
            },
            inverseSide: 'target_regions',
            createForeignKeyConstraints: false,
        }
    }
})