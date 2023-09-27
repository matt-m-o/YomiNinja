import { EntitySchema } from 'typeorm';
import { SettingsPreset } from '../../../../domain/settings_preset/settings_preset';
import { generateIndexName } from '../common/schema_helpers';


const name = 'settings_preset';
export const SettingsPresetTypeOrmSchema = new EntitySchema< SettingsPreset >({

    name,
    target: SettingsPreset,

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

        overlay: {
            type: 'json',
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