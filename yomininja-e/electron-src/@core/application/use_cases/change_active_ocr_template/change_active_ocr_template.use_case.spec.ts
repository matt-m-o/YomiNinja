import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { DataSource } from 'typeorm';
import { Language } from "../../../domain/language/language";
import { Profile } from "../../../domain/profile/profile";
import { ProfileTypeOrmSchema } from "../../../infra/db/typeorm/profile/profile.schema";
import { SettingsPresetTypeOrmSchema } from "../../../infra/db/typeorm/settings_preset/settings_preset.schema";
import { LanguageTypeOrmSchema } from "../../../infra/db/typeorm/language/language.schema";
import ProfileTypeOrmRepository from "../../../infra/db/typeorm/profile/profile.typeorm.repository";
import LanguageTypeOrmRepository from "../../../infra/db/typeorm/language/language.typeorm.repository";
import { ChangeActiveOcrTemplateUseCase, ChangeActiveOcrTemplate_Input } from "./change_active_ocr_template.use_case";
import { OcrTemplateTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_template.schema";
import { OcrTargetRegionTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.schema";
import { OcrTemplate } from "../../../domain/ocr_template/ocr_template";
import OcrTemplateTypeOrmRepository from "../../../infra/db/typeorm/ocr_template/ocr_template.typeorm.repository";

describe("ChangeActiveOcrTemplateUseCase tests", () => {
        
    let changeActiveOcrTemplateUseCase: ChangeActiveOcrTemplateUseCase;

    let initialProfile: Profile;

    let profilesRepo: ProfileTypeOrmRepository;

    let ocrTemplate: OcrTemplate;

    beforeEach( async () => {
        
        let dataSource = new DataSource({
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
        
        const settingsPreset = SettingsPreset.create();
        await dataSource.getRepository( SettingsPreset ).insert( settingsPreset );        

        const languageJa = Language.create({ name: 'japanese', two_letter_code: 'ja' });
        await dataSource.getRepository( Language ).insert( languageJa );

        
        const ocrTemplatesRepo = new OcrTemplateTypeOrmRepository(
            dataSource.getRepository( OcrTemplate )
        );
        ocrTemplate = OcrTemplate.create({
            name: 'Template 1',
            image: Buffer.from('')
        });
        await ocrTemplatesRepo.insert( ocrTemplate );
        ocrTemplate = await ocrTemplatesRepo.findOne({
            id: ocrTemplate.id
        }) as OcrTemplate;

        profilesRepo = new ProfileTypeOrmRepository( dataSource.getRepository( Profile ) );


        initialProfile = Profile.create({
            active_ocr_language: languageJa,
            active_settings_preset: settingsPreset,
        });

        await profilesRepo.insert( initialProfile );

        changeActiveOcrTemplateUseCase = new ChangeActiveOcrTemplateUseCase({
            profilesRepo,
            ocrTemplatesRepo
        });

    });

    it("should change the active ocr template from null to a ocr template", async () => {

        const input: ChangeActiveOcrTemplate_Input = {
            profileId: initialProfile.id,
            ocrTemplateId: ocrTemplate.id
        };

        await changeActiveOcrTemplateUseCase.execute( input );
        
        const currentProfile = await profilesRepo.findOne({ id: initialProfile.id });

        expect( currentProfile?.active_ocr_template )
            .toStrictEqual( ocrTemplate );
    });


    it("should change the active ocr template to null", async () => {

        const input: ChangeActiveOcrTemplate_Input = {
            profileId: initialProfile.id,
            ocrTemplateId: null
        };

        await changeActiveOcrTemplateUseCase.execute( input );
        
        const currentProfile = await profilesRepo.findOne({ id: initialProfile.id });

        expect( currentProfile?.active_ocr_template )
            .toStrictEqual( null );
    });
    
});