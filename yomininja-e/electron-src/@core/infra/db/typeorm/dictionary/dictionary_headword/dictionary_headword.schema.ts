

import { EntitySchema } from 'typeorm';
import { generateIndexName } from '../../common/schema_helpers';
import { DictionaryHeadword } from '../../../../../domain/dictionary/dictionary_headword/dictionary_headword';


const name = 'dictionary_headword';
export const DictionaryHeadwordTypeOrmSchema = new EntitySchema< DictionaryHeadword >({

    name,
    target: DictionaryHeadword,

    columns: {

        id: {
            type: Number,
            primary: true,
        },

        term: {
            type: String,
            length: 100,
        },
        
        reading: {
            type: String,
            length: 100,
        },

        furigana: {
            type: String,
            nullable: true,
        },

        term_length: {
            type: Number,            
        },

        reading_length: {
            type: Number,            
        },
    },

    relations: {
        tags: {
            type: 'many-to-many',
            target: 'DictionaryTag', // The target entity name
            joinTable: {
                name: 'dictionary_headwords_tags',
            },
            cascade: false,
            createForeignKeyConstraints: false,
        },       
        definitions: {
            type: 'one-to-many',
            target: 'DictionaryDefinition',
            inverseSide: 'headword',
            cascade: false,
        },
    },

    indices: [

        {
            name: generateIndexName(name, 'term_length'),
            columns: ['term_length'],
        },
        {
            name: generateIndexName(name, 'reading_length'),
            columns: ['reading_length'],
        },

    ]
});