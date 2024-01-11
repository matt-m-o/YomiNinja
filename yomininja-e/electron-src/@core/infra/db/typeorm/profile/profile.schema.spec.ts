import { DataSource, Repository } from 'typeorm';

import { SettingsPreset } from '../../../../domain/settings_preset/settings_preset';
import { ProfileTypeOrmSchema } from './profile.schema';
import { Profile } from '../../../../domain/profile/profile';
import { SettingsPresetTypeOrmSchema } from '../settings_preset/settings_preset.schema';
import { LanguageTypeOrmSchema } from '../language/language.schema';
import { Language } from '../../../../domain/language/language';
import { OcrTemplateTypeOrmSchema } from '../ocr_template/ocr_template.schema';
import { OcrTemplate } from '../../../../domain/ocr_template/ocr_template';
import { OcrTargetRegionTypeOrmSchema } from '../ocr_template/ocr_target_region/ocr_target_region.schema';
import { getDefaultSettingsPresetProps } from '../../../../domain/settings_preset/default_settings_preset_props';
import { ppOcrAdapterName } from '../../../ocr/ppocr.adapter/ppocr_settings';

describe( 'Profile Entity Schema tests', () => {

    let dataSource: DataSource;
    let profileTypeOrmRepo: Repository< Profile >;

    let settingsPreset: SettingsPreset;
    let languageJa: Language;
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
            ],
        });

        await dataSource.initialize();
        
        settingsPreset = SettingsPreset.create( getDefaultSettingsPresetProps() );
        await dataSource.getRepository( SettingsPreset ).insert( settingsPreset );
        
        languageJa = Language.create({ name: 'japanese', two_letter_code: 'ja' });
        await dataSource.getRepository( Language ).insert( languageJa );

        const ocrTemplateRepo = dataSource.getRepository( OcrTemplate );
        ocrTemplate = OcrTemplate.create({ name: 'Template 1', image: Buffer.from('') });
        await ocrTemplateRepo.insert( ocrTemplate );
        ocrTemplate = await ocrTemplateRepo.findOne({
            where: {
                id: ocrTemplate.id
            }
        }) as OcrTemplate;

        expect( ocrTemplate ).toBeTruthy();

        profileTypeOrmRepo = dataSource.getRepository( Profile );
    });

    it("should insert", async () => {        

        const profile = Profile.create({
            active_settings_preset: settingsPreset,
            active_ocr_language: languageJa,
            active_ocr_template: ocrTemplate,
            selected_ocr_adapter_name: ppOcrAdapterName
        });
        
        
        await profileTypeOrmRepo.save( profile );

        const foundProfile = await profileTypeOrmRepo.findOne({
            where: {
                id: profile.id
            },
            relations
        });
        

        expect( foundProfile ).toBeDefined();        
        expect( foundProfile ).toStrictEqual( profile );

    });


    it('should update', async () => {        
        
        const profile = Profile.create({
            active_settings_preset: settingsPreset,
            active_ocr_language: languageJa,
            active_ocr_template: undefined,
            selected_ocr_adapter_name: ppOcrAdapterName
        });
        const createdAt = profile.created_at;
        const updatedAt = profile.updated_at;
                
        await profileTypeOrmRepo.save( profile );

        const updatedName = 'New Name';
        profile.name = updatedName;        
        
        await profileTypeOrmRepo.save( profile );

        const foundProfile = await profileTypeOrmRepo.findOne({
            where: {
                id: profile.id
            },
            relations
        });
        // foundProfile?.nullCheck();

        
        expect( foundProfile ).toBeDefined();
        expect( foundProfile ).toStrictEqual( profile );
        expect( foundProfile?.name === updatedName ).toBeTruthy();
        expect( foundProfile?.created_at.getTime() ).toStrictEqual( createdAt.getTime() );
        expect( foundProfile?.updated_at.getTime() !== updatedAt.getTime() ).toBeTruthy();
    });
});