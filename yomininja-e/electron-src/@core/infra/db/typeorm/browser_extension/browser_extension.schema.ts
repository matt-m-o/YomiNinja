import { EntitySchema } from 'typeorm';

import { generateIndexName } from '../common/schema_helpers';
import { BrowserExtension } from '../../../../domain/browser_extension/browser_extension';



const name = 'browser_extension';
export const BrowserExtensionTypeOrmSchema = new EntitySchema< BrowserExtension >({

    name,
    target: BrowserExtension,

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

        description: {
            type: String,
            length: 100,
        },

        author: {
            type: String,
            length: 100,
            nullable: true,
        },

        version: {
            type: String,
            length: 50
        },

        icon: {
            type: 'blob',
            nullable: true,
        },

        optionsUrl: {
            type: String,
            length: 200,
            nullable: true,
        },

        enabled: {
            type: Boolean,
        }

    }

});