import { cloneDeep } from 'lodash';
import { SettingsPresetRepoFindOneInput, SettingsPresetRepository } from '../../../../domain/settings_preset/settings_preset.repository';
import { SettingsPreset } from '../../../../domain/settings_preset/settings_preset';


export class SettingsPresetInMemoryRepository implements SettingsPresetRepository {

    items = new Map< string, SettingsPreset >();

    constructor( items?: SettingsPreset[] ) {

        items?.forEach( item => this.items.set( item.id, item ) );
    }

    async insert( settingsPreset: SettingsPreset ): Promise< void > {
        this.items.set( settingsPreset.id, cloneDeep(settingsPreset) );
    }

    async update( updatedPreset: SettingsPreset ): Promise< void > {

        this.items.set( updatedPreset.id, cloneDeep(updatedPreset) );
    }

    async findOne( input: SettingsPresetRepoFindOneInput ): Promise< SettingsPreset | null > {        
        

        if ( input?.id )
            return this.items.get( input?.id ) || null;

        if ( input.name ) {
            
            for ( const [ id, obj ] of this.items ) {
    
                if ( obj.name === input.name )
                    return obj;
            }
        }


        return null;
    }

    async delete( name: string ): Promise< void > {

        this.items.delete( name );
    }

    async getAll(): Promise< SettingsPreset[] > {

        return Array.from( this.items, ( [ id, item ] ) => ( item ) );
    }
}