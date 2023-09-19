import { OcrResult_CreationInput } from "../../domain/ocr_result/ocr_result";
import { OcrTestAdapter } from "./ocr_test.adapter";

describe("OCR Test Adapter tests", () => {
                
    const ocrTestAdapterBaseProps: OcrResult_CreationInput = {
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

    beforeEach( () => {

        ocrTestAdapter = new OcrTestAdapter( ocrTestAdapterBaseProps, ocrTestAdapterSupportedLanguages );
        ocrTestAdapter.initialize();
    });

    it("should check if the test data is set", () => {
        
        expect( ocrTestAdapter.baseResultProps ).toStrictEqual( ocrTestAdapterBaseProps );
        expect( ocrTestAdapter.supportedLanguages ).toStrictEqual( ocrTestAdapterSupportedLanguages );
    });

    it("should recognize", async () => {

        const testText = "some text";

        const result = await ocrTestAdapter.recognize({
            id: 1,
            imageBuffer: Buffer.from(testText),
            languageCode: "en",
        });

        
        expect( result?.context_resolution ).toStrictEqual( ocrTestAdapterBaseProps.context_resolution );
        expect( result?.results[0].score ).toStrictEqual( ocrTestAdapterBaseProps.results?.[0].score );
        expect( result?.results[0].box ).toStrictEqual( ocrTestAdapterBaseProps.results?.[0].box );
        expect( result?.results[0].text ).toStrictEqual( testText );        
    });
    
    it("should get adapter supported languages", async () => {
        
        const result = await ocrTestAdapter.getSupportedLanguages();

        expect( result ).toStrictEqual( ocrTestAdapterSupportedLanguages );
    });
});