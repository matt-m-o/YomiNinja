import { OcrResult_CreationInput } from "../../../domain/ocr_result/ocr_result";
import { OcrTestAdapter } from "../../../infra/ocr_in_memory.adapter/ocr_test.adapter";
import { RecognizeImageInput, RecognizeImageUseCase } from "./recognize_image.use_case";
import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { DataSource } from 'typeorm';
import { Language } from "../../../domain/language/language";
import { Profile } from "../../../domain/profile/profile";
import { ProfileTypeOrmSchema } from "../../../infra/db/typeorm/profile/profile.schema";
import { SettingsPresetTypeOrmSchema } from "../../../infra/db/typeorm/settings_preset/settings_preset.schema";
import { LanguageTypeOrmSchema } from "../../../infra/db/typeorm/language/language.schema";
import ProfileTypeOrmRepository from "../../../infra/db/typeorm/profile/profile.typeorm.repository";

describe("Recognize Image Use Case tests", () => {    
                
    const ocrTestAdapterResultProps: OcrResult_CreationInput = {
        id: 1,
        context_resolution: {
            width: 1920,
            height: 1080,                        
        },
        results: [
            {
                text: "recognized_text",
                score: 0.99,
                box: {
                    top_left: { x: 0, y: 0 },
                    top_right: { x: 10, y: 0 },
                    bottom_left: { x: 0, y: 10 },
                    bottom_right: { x: 10, y: 10 },
                }
            }
        ]
    };

    const ocrTestAdapterSupportedLanguages = [ "en", "ja" ];
    

    let ocrTestAdapter: OcrTestAdapter;
    let recognizeImageUseCase: RecognizeImageUseCase;

    let profile: Profile;

    beforeEach( async () => {
        
        let dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                ProfileTypeOrmSchema,
                SettingsPresetTypeOrmSchema,
                LanguageTypeOrmSchema
            ],
        });

        await dataSource.initialize();
        
        const settingsPreset = SettingsPreset.create();
        await dataSource.getRepository( SettingsPreset ).insert( settingsPreset );

        const language = Language.create({ name: 'japanese', two_letter_code: 'ja' });
        await dataSource.getRepository( Language ).insert( language );

        const profileRepo = new ProfileTypeOrmRepository( dataSource.getRepository( Profile ) );

        profile = Profile.create({
            active_ocr_language: language,
            active_settings_preset: settingsPreset,
        });

        await profileRepo.insert( profile );
        
        ocrTestAdapter = new OcrTestAdapter( ocrTestAdapterResultProps, ocrTestAdapterSupportedLanguages );
        ocrTestAdapter.initialize();

        recognizeImageUseCase = new RecognizeImageUseCase(
            [ ocrTestAdapter ],
            profileRepo,
        );

    });

    it("should check if the use case has an adapter", () => {
        
        expect( recognizeImageUseCase.ocrAdapters ).toHaveLength( 1 );
        expect( recognizeImageUseCase.ocrAdapters[0] ).toStrictEqual( ocrTestAdapter );
        expect( recognizeImageUseCase.profileRepo ).toBeDefined();
    });

    it("should recognize using an OCR test adapter", async () => {

        const testText = "some text";

        const input: RecognizeImageInput = {
            imageBuffer: Buffer.from( testText ),            
            profileId: profile.id,
        };

        const result = await recognizeImageUseCase.execute( input );

        expect( result?.context_resolution ).toStrictEqual( ocrTestAdapterResultProps.context_resolution );
        expect( result?.results[0].text ).toStrictEqual( testText );
    });
    
});