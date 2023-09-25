import { EntitySchema } from 'typeorm';
import { Profile } from '../../../../domain/profile/profile';
import { generateIndexName } from '../common/schema_helpers';


const name = 'profile';
export const ProfileTypeOrmSchema = new EntitySchema< Profile >({

    name,
    target: Profile,

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

        ocr_language_code: {
            type: String,
            length: 100,
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

        // The plan will be embedded in queries containing { relations: ['active_settings_preset'] } option
        active_settings_preset: {
          type: 'many-to-one',
          target: 'SettingsPreset',
          joinColumn: {
            name: 'active_settings_preset_id',
          },          
          //inverseSide: '' // Note that this is relation name, not the entity name
          createForeignKeyConstraints: false,
        },
    },
})