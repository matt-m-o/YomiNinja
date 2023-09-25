import { DataSource, Repository } from 'typeorm';

import { SettingsPreset } from '../../../../domain/settings_preset/settings_preset';
import { ProfileTypeOrmSchema } from './profile.schema';
import { Profile } from '../../../../domain/profile/profile';
import { SettingsPresetTypeOrmSchema } from '../settings_preset/settings_preset.schema';

describe( 'SettingsPreset Entity Schema tests', () => {

    let dataSource: DataSource;
    let profileTypeOrmRepo: Repository< Profile >;

    let settingsPreset: SettingsPreset;

    beforeEach( async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ ProfileTypeOrmSchema, SettingsPresetTypeOrmSchema ],
        });

        await dataSource.initialize();
        
        settingsPreset = SettingsPreset.create();

        await dataSource.getRepository( SettingsPreset ).insert( settingsPreset );

        profileTypeOrmRepo = dataSource.getRepository( Profile );
    });

    it("should insert", async () => {        

        const profile = Profile.create({
            active_settings_preset: settingsPreset
        });
    
        
        await profileTypeOrmRepo.save( profile );

        const foundProfile = await profileTypeOrmRepo.findOne({
            where: {
                id: profile.id
            },
            relations: ['active_settings_preset'],
        });
        

        expect( foundProfile ).toBeDefined();        
        expect( foundProfile ).toStrictEqual( profile );

    });


    it('should update', async () => {        
        
        const profile = Profile.create({
            active_settings_preset: settingsPreset
        });
        const createdAt = profile.created_at;
        const updatedAt = profile.updated_at;
                
        await profileTypeOrmRepo.save( profile );

        const updatedName = 'New Name';
        profile.name = updatedName;        
        
        await profileTypeOrmRepo.save( profile );

        const foundProfile = await profileTypeOrmRepo.findOneBy( { id: profile.id } );

        
        expect( foundProfile).toBeDefined();
        expect( foundProfile?.name === updatedName ).toBeTruthy();
        expect( foundProfile?.created_at.getTime() ).toStrictEqual( createdAt.getTime() );
        expect( foundProfile?.updated_at.getTime() !== updatedAt.getTime() ).toBeTruthy();
    });
});