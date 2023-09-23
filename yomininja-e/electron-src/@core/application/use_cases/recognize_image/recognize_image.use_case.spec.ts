import { OcrResult_CreationInput } from "../../../domain/ocr_result/ocr_result";
import { OcrTestAdapter } from "../../../infra/ocr_in_memory.adapter/ocr_test.adapter";
import { RecognizeImageInput, RecognizeImageUseCase } from "./recognize_image.use_case";
import { SettingsPresetInMemoryRepository } from "../../../infra/db/in_memory/settings_preset/settings_preset.in_memory.repository";
import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";


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

    const settingsPreset = SettingsPreset.create();

    beforeEach( () => {

        ocrTestAdapter = new OcrTestAdapter( ocrTestAdapterResultProps, ocrTestAdapterSupportedLanguages );
        ocrTestAdapter.initialize();

        const settingsPresetRepo = new SettingsPresetInMemoryRepository(
            [ settingsPreset ]
        );

        recognizeImageUseCase = new RecognizeImageUseCase(
            [ ocrTestAdapter ],
            settingsPresetRepo,
        );

    });

    it("should check if the use case has an adapter", () => {
        
        expect( recognizeImageUseCase.ocrAdapters ).toHaveLength( 1 );
        expect( recognizeImageUseCase.ocrAdapters[0] ).toStrictEqual( ocrTestAdapter );
        expect( recognizeImageUseCase.settingsPresetRepository ).toBeDefined();
    });

    it("should recognize using an OCR test adapter", async () => {

        const testText = "some text";

        const input: RecognizeImageInput = {
            imageBuffer: Buffer.from( testText ),            
            settingsPresetId: settingsPreset.id,
        };

        const result = await recognizeImageUseCase.execute( input );

        expect( result?.context_resolution ).toStrictEqual( ocrTestAdapterResultProps.context_resolution );
        expect( result?.results[0].text ).toStrictEqual( testText );
    });
    
});