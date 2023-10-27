

import { EntitySchema } from 'typeorm';
import { DictionaryTag } from '../../../../../domain/dictionary/dictionary_tag/dictionary_tag';
import { generateIndexName } from '../../common/schema_helpers';


const name = 'dictionary_tag';
export const DictionaryTagTypeOrmSchema = new EntitySchema< DictionaryTag >({

    name,
    target: DictionaryTag,

    columns: {

        id: {
            type: Number,
            primary: true,
        },
        
        dictionary_id: {
            type: String,
            length: 40,
        },

        name: {
            type: String,
            length: 100,
        },

        category: {
            type: String,
            length: 100,
        },

        content: {
            type: String,
            length: 100,
        },

        order: {
            type: Number,
        },

        popularity_score: {
            type: Number
        }
    },

    indices: [

        {
            name: generateIndexName(name, 'dictionary_id'),
            columns: ['dictionary_id'],
        },

    ]
});