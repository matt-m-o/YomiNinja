import { Language } from "../../../domain/language/language";
import { Profile } from "../../../domain/profile/profile";
import { getDefaultSettingsPresetProps } from "../../../domain/settings_preset/default_settings_preset_props";
import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetInMemoryRepository } from "../../../infra/db/in_memory/settings_preset/settings_preset.in_memory.repository";
import { LanguageTypeOrmSchema } from "../../../infra/db/typeorm/language/language.schema";
import { OcrTargetRegionTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.schema";
import { OcrTemplateTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_template.schema";
import { ProfileTypeOrmSchema } from "../../../infra/db/typeorm/profile/profile.schema";
import ProfileTypeOrmRepository from "../../../infra/db/typeorm/profile/profile.typeorm.repository";
import { SettingsPresetTypeOrmSchema } from "../../../infra/db/typeorm/settings_preset/settings_preset.schema";
import SettingsPresetTypeOrmRepository from "../../../infra/db/typeorm/settings_preset/settings_preset.typeorm.repository";
import { ppOcrAdapterName } from "../../../infra/ocr/ppocr.adapter/ppocr_settings";
import { GetActiveSettingsPresetUseCase, GetActiveSettingsPreset_Input } from "./get_active_settings_preset.use_case";
import { DataSource } from 'typeorm';

describe("GetActiveSettingsPresetUseCase tests", () => {
                
    let profile: Profile;
    let defaultPreset: SettingsPreset;
        
    let getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;


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
        getActiveSettingsPresetUseCase = new GetActiveSettingsPresetUseCase(
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

    it("should get the active settings preset for the given profile", async () => {        

        const input: GetActiveSettingsPreset_Input = {
            profileId: profile.id            
        };

        const result = await getActiveSettingsPresetUseCase.execute( input );

        expect( result ).toStrictEqual( defaultPreset );        
    });
    
});