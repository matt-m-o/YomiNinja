import { EntitySchema } from 'typeorm';
import { SettingsPreset, SettingsPresetProps } from '../../../../domain/settings_preset/settings_preset';
import { generateIndexName } from '../common/schema_helpers';
import { SettingsPresetInstance } from '../../../types/entity_instance.types';


const name = 'settings_preset';
export const SettingsPresetTypeOrmSchema = new EntitySchema< SettingsPresetInstance >({

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

        ocr_engines: {
            type: 'json',
            nullable: true
        },

        version: {
            type: String,
            length: 50,
            default: ''
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