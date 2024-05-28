import { DataSource, Repository } from 'typeorm';
import { SettingsPresetRepository } from '../../../../domain/settings_preset/settings_preset.repository';

import { SettingsPreset } from '../../../../domain/settings_preset/settings_preset';
import { ProfileTypeOrmSchema } from './profile.schema';
import ProfileTypeOrmRepository from './profile.typeorm.repository';
import { Profile } from '../../../../domain/profile/profile';
import { ProfileRepository } from '../../../../domain/profile/profile.repository';
import { SettingsPresetTypeOrmSchema } from '../settings_preset/settings_preset.schema';
import { Language } from '../../../../domain/language/language';
import { LanguageTypeOrmSchema } from '../language/language.schema';
import { OcrTemplate } from '../../../../domain/ocr_template/ocr_template';
import { OcrTemplateTypeOrmSchema } from '../ocr_template/ocr_template.schema';
import { OcrTargetRegionTypeOrmSchema } from '../ocr_template/ocr_target_region/ocr_target_region.schema';
import { getDefaultSettingsPresetProps } from '../../../../domain/settings_preset/default_settings_preset_props';
import { ppOcrAdapterName } from '../../../ocr/ppocr.adapter/ppocr_settings';


describe( "Profile TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< Profile >;
    let repo: ProfileRepository;

    let settingsPreset: SettingsPreset;
    let languageJa: Language;
    let languageEn: Language;
    let ocrTemplate: OcrTemplate;

    const relations = [
        'active_settings_preset',
        'active_ocr_language',
        'active_ocr_template'
    ];

    beforeEach( async () => {
        
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                ProfileTypeOrmSchema,
                SettingsPresetTypeOrmSchema,
                LanguageTypeOrmSchema,
                OcrTemplateTypeOrmSchema,
                OcrTargetRegionTypeOrmSchema
            ]
        });

        await dataSource.initialize();

        settingsPreset = SettingsPreset.create( getDefaultSettingsPresetProps() );
        await dataSource.getRepository( SettingsPreset ).insert( settingsPreset );
        
        languageJa = Language.create({ name: 'japanese', two_letter_code: 'ja' });
        languageEn = Language.create({ name: 'english', two_letter_code: 'en' });
        await dataSource.getRepository( Language ).insert([
            languageJa,
            languageEn
        ]);

        const ocrTemplateRepo = dataSource.getRepository( OcrTemplate );
        ocrTemplate = OcrTemplate.create({ name: 'Template 1', image: Buffer.from('') });
        await ocrTemplateRepo.insert( ocrTemplate );
        ocrTemplate = await ocrTemplateRepo.findOne({
            where: {
                id: ocrTemplate.id
            }
        }) as OcrTemplate;

        // Settings Preset repository by TypeOrm
        ormRepo = dataSource.getRepository( Profile );
        
        // actual repository
        repo = new ProfileTypeOrmRepository( ormRepo );
    });

    it('should insert', async () => {

        const profile = Profile.create({
            active_settings_preset: settingsPreset,
            active_ocr_language: languageJa,
            selected_ocr_adapter_name: ppOcrAdapterName
        });

        await repo.insert( profile );

        const foundProfile = await ormRepo.findOne({
            where: {
                id: profile.id
            },
            relations,
        });
        // foundProfile?.nullCheck();

        expect( foundProfile ).toStrictEqual( profile );
    });

    it('should update', async () => {

        const profile = Profile.create({
            active_settings_preset: settingsPreset,
            active_ocr_language: languageJa,
            active_ocr_template: undefined,
            selected_ocr_adapter_name: ppOcrAdapterName
        });
        await ormRepo.save( profile );

        profile.name = 'custom name';
        profile.active_ocr_language = languageEn;
        await repo.update( profile );

        const foundProfile = await ormRepo.findOne({
            where: {
                id: profile.id
            },
            relations,
        });
        // foundProfile?.nullCheck();

        expect( foundProfile ).toStrictEqual( profile );        
    });

    it('should find ONE by id and name', async () => {

        const defaultProfile = Profile.create({
            active_settings_preset: settingsPreset,
            active_ocr_language: languageJa,
            selected_ocr_adapter_name: ppOcrAdapterName
        });
        const customProfile = Profile.create({
            name: 'custom',
            active_settings_preset: settingsPreset,
            active_ocr_language: languageEn,
            selected_ocr_adapter_name: ppOcrAdapterName
        });
        await ormRepo.save([
            defaultProfile,
            customProfile
        ]);

        const foundById = await repo.findOne({ id: customProfile.id });
        const foundByName = await repo.findOne({ name: customProfile.name });        
        // foundById?.nullCheck();
        // foundByName?.nullCheck();
        
        expect( foundById ).toStrictEqual( customProfile );
        expect( foundByName ).toStrictEqual( customProfile );
    });

    it('should find ALL', async () => {

        const defaultProfile = Profile.create({
            active_settings_preset: settingsPreset,
            active_ocr_language: languageJa,
            selected_ocr_adapter_name: ppOcrAdapterName
        });
        const customProfile = Profile.create({
            name: 'custom',
            active_settings_preset: settingsPreset,
            active_ocr_language: languageEn,
            selected_ocr_adapter_name: ppOcrAdapterName
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
            active_ocr_language: languageJa,
            selected_ocr_adapter_name: ppOcrAdapterName
        });
        const customProfile = Profile.create({
            name: 'custom',
            active_settings_preset: settingsPreset,
            active_ocr_language: languageEn,
            selected_ocr_adapter_name: ppOcrAdapterName
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