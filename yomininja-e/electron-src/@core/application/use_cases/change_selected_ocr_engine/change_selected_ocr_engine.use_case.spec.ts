import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { DataSource } from 'typeorm';
import { Language } from "../../../domain/language/language";
import { Profile } from "../../../domain/profile/profile";
import { ProfileTypeOrmSchema } from "../../../infra/db/typeorm/profile/profile.schema";
import { SettingsPresetTypeOrmSchema } from "../../../infra/db/typeorm/settings_preset/settings_preset.schema";
import { LanguageTypeOrmSchema } from "../../../infra/db/typeorm/language/language.schema";
import ProfileTypeOrmRepository from "../../../infra/db/typeorm/profile/profile.typeorm.repository";
import { OcrTemplateTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_template.schema";
import { OcrTargetRegionTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.schema";
import { OcrTemplate } from "../../../domain/ocr_template/ocr_template";
import OcrTemplateTypeOrmRepository from "../../../infra/db/typeorm/ocr_template/ocr_template.typeorm.repository";
import { OcrTargetRegion } from "../../../domain/ocr_template/ocr_target_region/ocr_target_region";
import { ppOcrAdapterName } from "../../../infra/ocr/ppocr.adapter/ppocr_settings";
import { ChangeSelectedOcrEngineUseCase, ChangeSelectedOcrEngine_Input } from "./change_selected_ocr_engine.use_case";
import { cloudVisionOcrAdapterName } from "../../../infra/ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings";

describe("ChangeActiveOcrTemplateUseCase tests", () => {
        
    let changeSelectedOcrEngineUseCase: ChangeSelectedOcrEngineUseCase;

    let initialProfile: Profile;

    let profilesRepo: ProfileTypeOrmRepository;


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
            dataSource.getRepository( OcrTemplate ),
            dataSource.getRepository( OcrTargetRegion )
        );

        profilesRepo = new ProfileTypeOrmRepository( dataSource.getRepository( Profile ) );

        initialProfile = Profile.create({
            active_ocr_language: languageJa,
            active_settings_preset: settingsPreset,
            selected_ocr_adapter_name: ppOcrAdapterName
        });

        await profilesRepo.insert( initialProfile );

        changeSelectedOcrEngineUseCase = new ChangeSelectedOcrEngineUseCase({
            profilesRepo,
        });

    });

    it("should change the selected OCR engine", async () => {

        const input: ChangeSelectedOcrEngine_Input = {
            profileId: initialProfile.id,
            ocrEngineAdapterName: cloudVisionOcrAdapterName
        };

        await changeSelectedOcrEngineUseCase.execute( input );
        
        const currentProfile = await profilesRepo.findOne({
            id: initialProfile.id
        });

        expect( currentProfile?.selected_ocr_adapter_name )
            .toStrictEqual( input.ocrEngineAdapterName );
    });
    
});