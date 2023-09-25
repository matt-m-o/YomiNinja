import { DataSource, Repository } from 'typeorm';
import { SettingsPresetRepository } from '../../../../domain/settings_preset/settings_preset.repository';
import { SettingsPresetTypeOrmSchema } from './settings_preset.schema';
import { SettingsPreset } from '../../../../domain/settings_preset/settings_preset';
import SettingsPresetTypeOrmRepository from './settings_preset.typeorm.repository';

describe( "Settings Preset TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< SettingsPreset >;
    let repo: SettingsPresetRepository;

    beforeEach( async () => {
        
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ SettingsPresetTypeOrmSchema ]
        });

        await dataSource.initialize();

        // Settings Preset repository by TypeOrm
        ormRepo = dataSource.getRepository( SettingsPreset );
        
        // actual repository
        repo = new SettingsPresetTypeOrmRepository( ormRepo );
    });

    it('should insert', async () => {

        const settingsPreset = SettingsPreset.create();

        await repo.insert( settingsPreset );

        const foundPreset = await ormRepo.findOneBy({ id: settingsPreset.id });

        expect( foundPreset ).toStrictEqual( settingsPreset );
    });

    it('should update', async () => {

        const settingsPreset = SettingsPreset.create();
        await ormRepo.save( settingsPreset );

        settingsPreset.name = 'custom name';
        await repo.update( settingsPreset );

        const foundPreset = await ormRepo.findOneBy({ id: settingsPreset.id });

        expect( foundPreset ).toStrictEqual( settingsPreset );        
    });

    it('should find ONE by id and name', async () => {

        const defaultPreset = SettingsPreset.create();
        const customPreset = SettingsPreset.create({ name: 'custom' });
        await ormRepo.save([
            defaultPreset,
            customPreset
        ]);

        const foundById = await repo.findOne({ id: customPreset.id });
        const foundByName = await repo.findOne({ name: customPreset.name });        

        expect( foundById ).toStrictEqual( customPreset );
        expect( foundByName ).toStrictEqual( customPreset );
    });

    it('should find ALL', async () => {

        const defaultPreset = SettingsPreset.create();
        const customPreset = SettingsPreset.create({ name: 'custom' });
        await ormRepo.save([
            defaultPreset,
            customPreset
        ]);        

        const foundPresets = await repo.getAll();        

        expect( foundPresets ).toHaveLength( 2 );
        expect( foundPresets[0] ).toStrictEqual( defaultPreset );
        expect( foundPresets[1] ).toStrictEqual( customPreset );
    });

    it('should delete one', async () => {

        const defaultPreset = SettingsPreset.create();
        const customPreset = SettingsPreset.create({ name: 'custom' });
        await ormRepo.save([
            defaultPreset,
            customPreset
        ]);        

        await repo.delete( customPreset.id );

        const foundPreset = await repo.findOne({ id: customPreset.id });
        
        expect( foundPreset ).toBeFalsy();        
    });
})