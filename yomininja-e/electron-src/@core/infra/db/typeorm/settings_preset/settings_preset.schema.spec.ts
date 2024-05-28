import { DataSource, Repository } from 'typeorm';
import { SettingsPresetTypeOrmSchema } from './settings_preset.schema';
import { SettingsPreset } from '../../../../domain/settings_preset/settings_preset';
import { SettingsPresetInstance, SettingsPresetInstanceProps } from '../../../types/entity_instance.types';
import { getDefaultSettings } from 'http2';
import { getDefaultSettingsPresetProps } from '../../../../domain/settings_preset/default_settings_preset_props';

describe( 'SettingsPreset Entity Schema tests', () => {

    let dataSource: DataSource;
    let settingsPresetTypeOrmRepo: Repository< SettingsPresetInstance >;

    const defaultSettingsProps = getDefaultSettingsPresetProps();

    beforeEach( async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ SettingsPresetTypeOrmSchema ],
        });

        await dataSource.initialize();

        settingsPresetTypeOrmRepo = dataSource.getRepository( SettingsPreset< SettingsPresetInstanceProps > );
    });

    it("should insert", async () => {

        const settingsPreset = SettingsPreset.create( defaultSettingsProps );        
        
        await settingsPresetTypeOrmRepo.save(settingsPreset);

        console.log( settingsPreset )

        const foundPreset = await settingsPresetTypeOrmRepo.findOneBy({ id: settingsPreset.id });
        

        expect( foundPreset ).toBeDefined();
        expect( foundPreset?.id ).toStrictEqual( settingsPreset.id );
        expect( foundPreset ).toStrictEqual( settingsPreset );

    });


    it('should update', async () => {        
        
        const settingsPreset = SettingsPreset.create( defaultSettingsProps );
        const createdAt = settingsPreset.created_at;
        const updatedAt = settingsPreset.updated_at;
                
        await settingsPresetTypeOrmRepo.save( settingsPreset );

        const updatedName = 'New Name';
        settingsPreset.name = updatedName;        
        
        await settingsPresetTypeOrmRepo.save( settingsPreset );

        const foundPreset = await settingsPresetTypeOrmRepo.findOneBy( { id: settingsPreset.id } );

        
        expect( foundPreset).toBeDefined();
        expect( foundPreset?.name === updatedName ).toBeTruthy();
        expect( foundPreset?.created_at).toStrictEqual( settingsPreset.created_at );
        expect( foundPreset?.updated_at.getTime() !== updatedAt.getTime() ).toBeTruthy();
    });
});