

import { EntitySchema } from 'typeorm';
import { DictionaryDefinition } from '../../../../../domain/dictionary/dictionary_definition/dictionary_definition';
import { generateIndexName } from '../../common/schema_helpers';


const name = 'dictionary_definition';
export const DictionaryDefinitionTypeOrmSchema = new EntitySchema< DictionaryDefinition >({

    name,
    target: DictionaryDefinition,

    columns: {

        id: {
            type: String,
            length: 40,
            primary: true,
        },

        dictionary_headword_id: {
            type: String,
            length: 40,
        },
        
        dictionary_id: {
            type: String,
            length: 40,
        },

        definitions: {
            type: 'simple-json',            
        },

        popularity_score: {
            type: Number,
        },
    },

    relations: {
        tags: {
            type: 'many-to-many',
            target: 'DictionaryTag', // The target entity name
            joinTable: {
                name: 'dictionary_definitions_tags',
            },
            cascade: false,
            default: [],
            eager: true,
        },
        headword: {
            type: 'many-to-one',
            target: 'DictionaryHeadword',
            joinColumn: {
                name: 'dictionary_headword_id',                
            },
            inverseSide: 'definitions',
            createForeignKeyConstraints: false,
            default: []
        }
    },

    indices: [

        {
            name: generateIndexName(name, 'dictionary_id'),
            columns: ['dictionary_id'],
        },
        {
            name: generateIndexName(name, 'dictionary_headword_id'),
            columns: ['dictionary_headword_id'],
        },

    ]
});