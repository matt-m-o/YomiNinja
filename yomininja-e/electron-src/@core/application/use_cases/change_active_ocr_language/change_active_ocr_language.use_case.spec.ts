import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { DataSource } from 'typeorm';
import { Language } from "../../../domain/language/language";
import { Profile } from "../../../domain/profile/profile";
import { ProfileTypeOrmSchema } from "../../../infra/db/typeorm/profile/profile.schema";
import { SettingsPresetTypeOrmSchema } from "../../../infra/db/typeorm/settings_preset/settings_preset.schema";
import { LanguageTypeOrmSchema } from "../../../infra/db/typeorm/language/language.schema";
import ProfileTypeOrmRepository from "../../../infra/db/typeorm/profile/profile.typeorm.repository";
import { ChangeActiveLanguage_Input, ChangeActiveOcrLanguageUseCase } from "./change_active_ocr_language.use_case";
import LanguageTypeOrmRepository from "../../../infra/db/typeorm/language/language.typeorm.repository";
import { OcrTemplateTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_template.schema";
import { OcrTargetRegionTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.schema";
import { ppOcrAdapterName } from "../../../infra/ocr/ppocr.adapter/ppocr_settings";

describe("ChangeActiveOcrLanguageUseCase tests", () => {
        
    let changeActiveOcrLanguageUseCase: ChangeActiveOcrLanguageUseCase;

    let initialProfile: Profile;

    let profileRepo: ProfileTypeOrmRepository;

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

        const languageJa = Language.create({ name: 'japanese', two_letter_code: 'ja', bcp47_tag: 'ja-JP' });
        const languageEn = Language.create({ name: 'english', two_letter_code: 'en', bcp47_tag: 'en-US' });

        profileRepo = new ProfileTypeOrmRepository( dataSource.getRepository( Profile ) );
        const languageRepo = new LanguageTypeOrmRepository( dataSource.getRepository( Language ) );        

        await languageRepo.insert( languageJa );
        await languageRepo.insert( languageEn );

        initialProfile = Profile.create({
            active_ocr_language: languageJa,
            active_settings_preset: settingsPreset,
            selected_ocr_adapter_name: ppOcrAdapterName
        });

        await profileRepo.insert( initialProfile );

        changeActiveOcrLanguageUseCase = new ChangeActiveOcrLanguageUseCase(
            profileRepo,
            languageRepo
        );

    });

    it("should get the active ocr language from japanese to english", async () => {

        const input: ChangeActiveLanguage_Input = {
            profileId: initialProfile.id,
            languageBcp47Tag: 'ja-JP'
        };

        expect( initialProfile.active_ocr_language.two_letter_code ).toStrictEqual('ja');

        await changeActiveOcrLanguageUseCase.execute( input );
        
        const currentProfile = await profileRepo.findOne({ id: initialProfile.id });

        expect( currentProfile?.active_ocr_language.two_letter_code ).toStrictEqual('ja');        
    });
    
});