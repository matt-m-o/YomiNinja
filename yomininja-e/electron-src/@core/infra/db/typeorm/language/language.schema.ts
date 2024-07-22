import { EntitySchema } from 'typeorm';

import { generateIndexName } from '../common/schema_helpers';
import { Language } from '../../../../domain/language/language';


const name = 'language';
export const LanguageTypeOrmSchema = new EntitySchema< Language >({

    name,
    target: Language,

    columns: {

        id: {
            type: String,
            length: 100,
            primary: true,
        },
        
        name: {
            type: String,
            length: 100,
        },

        two_letter_code: {
            type: String,
            length: 2,
        },

        three_letter_code: {
            type: String,
            length: 3,
            nullable: true
        },

        bcp47_tag: {
            type: String,
            length: 20,
            nullable: true
        }
    }

});