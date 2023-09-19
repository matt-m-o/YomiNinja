import { OcrResult, OcrResultProperties } from "../../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrRecognitionInput } from "../../adapters/ocr.adapter";
import { OcrTestAdapter } from "../../../infra/ocr_in_memory.adapter/ocr_test.adapter";
import { GetSupportedLanguagesUseCase } from "./get_supported_languages.use_case";



describe("Get Supported Languages Use Case tests", () => {
                
    const ocrTestAdapterResultProps: OcrResultProperties = {
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
    let getSupportedLanguages: GetSupportedLanguagesUseCase;

    beforeEach( () => {

        ocrTestAdapter = new OcrTestAdapter( ocrTestAdapterResultProps, ocrTestAdapterSupportedLanguages );
        ocrTestAdapter.initialize();
        getSupportedLanguages = new GetSupportedLanguagesUseCase( [ ocrTestAdapter ] );        
    });

    it("should check if the use case has an adapter", () => {
        
        expect( getSupportedLanguages.ocrAdapters ).toHaveLength( 1 );
        expect( getSupportedLanguages.ocrAdapters[0] ).toStrictEqual( ocrTestAdapter );
    });

    it("should recognize using an OCR test adapter", async () => {


        const result = await getSupportedLanguages.execute();

        expect( result.length > 0 ).toBeTruthy();
        expect( result[0].adapterName ).toStrictEqual( OcrTestAdapter._name );
        expect( result[0].languageCodes ).toStrictEqual( ocrTestAdapterSupportedLanguages );       
    });
    
});