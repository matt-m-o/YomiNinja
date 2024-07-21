import { OcrResult_CreationInput } from "../../../domain/ocr_result/ocr_result";
import { FakeOcrEngineSettings, FakeOcrTestAdapter } from "../../../infra/test/fake_ocr.adapter/fake_ocr.adapter";
import { FakeImageProcessingAdapter } from "../../../infra/test/fake_image_processing.adapter/fake_image_processing.adapter.adapter";
import { RecognizeImageInput, RecognizeImageUseCase } from "./recognize_image.use_case";
import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { DataSource } from 'typeorm';
import { Language } from "../../../domain/language/language";
import { Profile } from "../../../domain/profile/profile";
import { ProfileTypeOrmSchema } from "../../../infra/db/typeorm/profile/profile.schema";
import { SettingsPresetTypeOrmSchema } from "../../../infra/db/typeorm/settings_preset/settings_preset.schema";
import { LanguageTypeOrmSchema } from "../../../infra/db/typeorm/language/language.schema";
import ProfileTypeOrmRepository from "../../../infra/db/typeorm/profile/profile.typeorm.repository";
import { OcrTemplate } from "../../../domain/ocr_template/ocr_template";
import { OcrTargetRegion } from "../../../domain/ocr_template/ocr_target_region/ocr_target_region";
import { OcrTemplateTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_template.schema";
import { OcrTargetRegionTypeOrmSchema } from "../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.schema";
import { getDefaultSettingsPresetProps } from "../../../domain/settings_preset/default_settings_preset_props";
import { ppOcrAdapterName } from "../../../infra/ocr/ppocr.adapter/ppocr_settings";
import { PyVideoAnalyzerAdapter } from "../../../infra/ocr/py_video_analyzer.adapter/py_video_analyzer.adapter";

describe("Recognize Image Use Case tests", () => {    
                
    const ocrTestAdapterResultProps: OcrResult_CreationInput = {
        id: '1',
        context_resolution: {
            width: 1920,
            height: 1080,                        
        },
        results: [
            {
                text: [{ content: "recognized_text" }],
                recognition_score: 0.99,
                classification_score: 0.99,
                classification_label: 1,
                box: {
                    top_left: { x: 0, y: 0 },
                    top_right: { x: 10, y: 0 },
                    bottom_left: { x: 0, y: 10 },
                    bottom_right: { x: 10, y: 10 },
                }
            },
            {
                text: [{ content: "recognized_text" }],
                recognition_score: 0.99,
                classification_score: 0.99,
                classification_label: 1,
                box: {
                    top_left: { x: 10, y: 10 },
                    top_right: { x: 20, y: 10 },
                    bottom_left: { x: 10, y: 20 },
                    bottom_right: { x: 20, y: 20 },
                }
            }
        ]
    };

    const ocrTestAdapterSupportedLanguages = [ "en", "ja" ];
    

    let ocrTestAdapter: FakeOcrTestAdapter;
    let recognizeImageUseCase: RecognizeImageUseCase< FakeOcrEngineSettings >;

    let profile: Profile;

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

        ocrTestAdapter = new FakeOcrTestAdapter( ocrTestAdapterResultProps, ocrTestAdapterSupportedLanguages );
        ocrTestAdapter.initialize();

        const defaultSettingsProps = getDefaultSettingsPresetProps();
        defaultSettingsProps.ocr_engines.push( ocrTestAdapter.getDefaultSettings() );
        
        const settingsPreset = SettingsPreset.create( defaultSettingsProps );
        await dataSource.getRepository( SettingsPreset ).insert( settingsPreset );

        const language = Language.create({ name: 'japanese', two_letter_code: 'ja' });
        await dataSource.getRepository( Language ).insert( language );

        const profileRepo = new ProfileTypeOrmRepository( dataSource.getRepository( Profile ) );

        profile = Profile.create({
            active_ocr_language: language,
            active_settings_preset: settingsPreset,
            selected_ocr_adapter_name: ppOcrAdapterName
        });

        await profileRepo.insert( profile );
        

        const imageProcessingDummyAdapter = new FakeImageProcessingAdapter();

        recognizeImageUseCase = new RecognizeImageUseCase(
            [ ocrTestAdapter ],
            imageProcessingDummyAdapter,
            profileRepo,
            new PyVideoAnalyzerAdapter()
        );

        ocrTemplate = OcrTemplate.create({
            id: 1,
            image: Buffer.from(''),
            name: 'template',
        });

        const targetRegion = OcrTargetRegion.create({
            ocr_template_id: ocrTemplate.id,
            position: {
                top: 0.5,
                left: 0.5,
            },
            size: {
                width: 0.5,
                height: 0.5,
            },
        });

        ocrTemplate.addTargetRegion( targetRegion );


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
            ocrAdapterName: FakeOcrTestAdapter._name
        };

        const result = await recognizeImageUseCase.execute( input );

        expect( result ).toBeTruthy();
        if ( !result ) return;

        const { ocr_regions } = result;

        expect( result?.context_resolution ).toStrictEqual( ocrTestAdapterResultProps.context_resolution );
        expect( ocr_regions[0].results?.[0].text[0].content ).toStrictEqual( testText );
    });
    
});