import { DataSource, Repository } from 'typeorm';
import { SettingsPresetRepository } from '../../../../domain/settings_preset/settings_preset.repository';

import { SettingsPreset } from '../../../../domain/settings_preset/settings_preset';
import { ProfileTypeOrmSchema } from './profile.schema';
import ProfileTypeOrmRepository from './profile.typeorm.repository';
import { Profile } from '../../../../domain/profile/profile';
import { ProfileRepository } from '../../../../domain/profile/profile.repository';
import { SettingsPresetTypeOrmSchema } from '../settings_preset/settings_preset.schema';


describe( "Profile TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< Profile >;
    let repo: ProfileRepository;

    let settingsPreset: SettingsPreset;

    beforeEach( async () => {
        
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ ProfileTypeOrmSchema, SettingsPresetTypeOrmSchema ]
        });

        await dataSource.initialize();

        settingsPreset = SettingsPreset.create();

        await dataSource.getRepository( SettingsPreset ).insert( settingsPreset );

        // Settings Preset repository by TypeOrm
        ormRepo = dataSource.getRepository( Profile );
        
        // actual repository
        repo = new ProfileTypeOrmRepository( ormRepo );
    });

    it('should insert', async () => {

        const profile = Profile.create({
            active_settings_preset: settingsPreset
        });

        await repo.insert( profile );

        const foundProfile = await ormRepo.findOne({
            where: {
                id: profile.id
            },
            relations: ['active_settings_preset']
        });

        expect( foundProfile ).toStrictEqual( profile );
    });

    it('should update', async () => {

        const profile = Profile.create({
            active_settings_preset: settingsPreset
        });
        await ormRepo.save( profile );

        profile.name = 'custom name';
        await repo.update( profile );

        const foundPreset = await ormRepo.findOne({
            where: {
                id: profile.id
            },
            relations: ['active_settings_preset']
        });

        expect( foundPreset ).toStrictEqual( profile );        
    });

    it('should find ONE by id and name', async () => {

        const defaultProfile = Profile.create({
            active_settings_preset: settingsPreset,
        });
        const customProfile = Profile.create({
            name: 'custom',
            active_settings_preset: settingsPreset,
        });
        await ormRepo.save([
            defaultProfile,
            customProfile
        ]);

        const foundById = await repo.findOne({ id: customProfile.id });
        const foundByName = await repo.findOne({ name: customProfile.name });        

        expect( foundById ).toStrictEqual( customProfile );
        expect( foundByName ).toStrictEqual( customProfile );
    });

    it('should find ALL', async () => {

        const defaultProfile = Profile.create({
            active_settings_preset: settingsPreset,
        });
        const customProfile = Profile.create({
            name: 'custom',
            active_settings_preset: settingsPreset
        });
        await ormRepo.save([
            defaultProfile,
            customProfile
        ]);        

        const foundProfiles = await repo.getAll();

        expect( foundProfiles ).toHaveLength( 2 );
        expect( foundProfiles[0] ).toStrictEqual( defaultProfile );
        expect( foundProfiles[1] ).toStrictEqual( customProfile );
    });

    it('should delete one', async () => {

        const defaultProfile = Profile.create({
            active_settings_preset: settingsPreset,
        });
        const customProfile = Profile.create({
            name: 'custom',
            active_settings_preset: settingsPreset,
        });
        await ormRepo.save([
            defaultProfile,
            customProfile
        ]);        

        await repo.delete( customProfile.id );

        const foundProfile = await repo.findOne({ id: customProfile.id });
        
        expect( foundProfile ).toBeFalsy();        
    });
})