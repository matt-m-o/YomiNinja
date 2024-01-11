import { Language } from "../../../domain/language/language";
import { Profile } from "../../../domain/profile/profile";
import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetInMemoryRepository } from "../../../infra/db/in_memory/settings_preset/settings_preset.in_memory.repository";
import { LanguageTypeOrmSchema } from "../../../infra/db/typeorm/language/language.schema";
import { ProfileTypeOrmSchema } from "../../../infra/db/typeorm/profile/profile.schema";
import ProfileTypeOrmRepository from "../../../infra/db/typeorm/profile/profile.typeorm.repository";
import { SettingsPresetTypeOrmSchema } from "../../../infra/db/typeorm/settings_preset/settings_preset.schema";

import { DataSource } from 'typeorm';
import { GetProfileUseCase, GetProfile_Input } from "./get_profile.use_case";
import { OcrTemplateTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_template.schema";
import { OcrTargetRegionTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.schema";
import { getDefaultSettingsPresetProps } from "../../../domain/settings_preset/default_settings_preset_props";
import { ppOcrAdapterName } from "../../../infra/ocr/ppocr.adapter/ppocr_settings";

describe("GetProfileUseCase tests", () => {
                
    let profile: Profile;
    let defaultPreset: SettingsPreset;
        
    let getProfileUseCase: GetProfileUseCase;


    beforeEach( async () => {

        const dataSource = new DataSource({
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

        const profileRepo = new ProfileTypeOrmRepository(
            dataSource.getRepository( Profile )
        );        
        getProfileUseCase = new GetProfileUseCase(
            profileRepo
        );
            
        defaultPreset = SettingsPreset.create( getDefaultSettingsPresetProps() );
        await dataSource.getRepository( SettingsPreset ).insert( defaultPreset );

        const language = Language.create({ name: 'japanese', two_letter_code: 'ja' });
        await dataSource.getRepository( Language ).insert( language );

        profile = Profile.create({
            active_ocr_language: language,
            active_settings_preset: defaultPreset,
            selected_ocr_adapter_name: ppOcrAdapterName
        });
        await dataSource.getRepository( Profile ).insert( profile );
    });

    it("should get the profile for the given profileId", async () => {        

        const input: GetProfile_Input = {
            profileId: profile.id            
        };

        const result = await getProfileUseCase.execute( input );

        expect( result ).toStrictEqual( profile );        
    });
    
});