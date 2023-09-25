import { DataSource, Repository } from 'typeorm';
import { SettingsPresetTypeOrmSchema } from './settings_preset.schema';
import { SettingsPreset } from '../../../../domain/settings_preset/settings_preset';

describe( 'SettingsPreset Entity Schema tests', () => {

    let dataSource: DataSource;
    let settingsPresetTypeOrmRepo: Repository< SettingsPreset >;

    beforeEach( async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ SettingsPresetTypeOrmSchema ],
        });

        await dataSource.initialize();

        settingsPresetTypeOrmRepo = dataSource.getRepository( SettingsPreset );
    });

    it("should insert", async () => {

        const settingsPreset = SettingsPreset.create();

        //console.log(user);
        
        await settingsPresetTypeOrmRepo.save(settingsPreset);

        const foundPreset = await settingsPresetTypeOrmRepo.findOneBy({ id: settingsPreset.id });

        //console.log(foundUser);

        expect( foundPreset ).toBeDefined();
        expect( foundPreset?.id ).toStrictEqual( settingsPreset.id );
        expect( foundPreset ).toStrictEqual( settingsPreset );

    });


    it('should update', async () => {        
        
        const settingsPreset = SettingsPreset.create();
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