import { cloneDeep } from 'lodash';
import { SettingsPresetRepository } from '../../../domain/settings_preset/settings_preset.repository';
import { SettingsPreset } from '../../../domain/settings_preset/settings_preset';


export default class SettingsPresetInMemoryRepository implements SettingsPresetRepository {

    items = new Map< string, SettingsPreset >();

    constructor( items?: SettingsPreset[] ) {

        items?.forEach( item => this.items.set( item.name, item ) );
    }

    async insert( settingsPreset: SettingsPreset ): Promise< void > {
        this.items.set( settingsPreset.name, cloneDeep(settingsPreset) );
    }

    async update( updatedPreset: SettingsPreset ): Promise< void > {

        this.items.set( updatedPreset.name, cloneDeep(updatedPreset) );
    }

    async findOne( name: string ): Promise< SettingsPreset | null > {        

        return this.items.get( name ) || null;
    }

    async delete( name: string ): Promise< void > {

        this.items.delete( name );
    }

    async getAll(): Promise< SettingsPreset[] > {

        return Array.from( this.items, ( [name, item] ) => ( item ) );
    }
}