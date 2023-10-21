

import { EntitySchema } from 'typeorm';
import { generateIndexName } from '../common/schema_helpers';
import { Dictionary } from '../../../../domain/dictionary/dictionary';


const name = 'dictionary';
export const DictionaryTypeOrmSchema = new EntitySchema< Dictionary >({

    name,
    target: Dictionary,

    columns: {

        id: {
            type: String,
            length: 40,
            primary: true,
        },

        name: {
            type: String,
            length: 100,
        },

        source_language: {
            type: String,
            length: 10,
        },

        target_language: {
            type: String,
            length: 10
        },
        
        order: {
            type: Number,            
        },

        enabled: {
            type: Boolean,
        },
    }
});