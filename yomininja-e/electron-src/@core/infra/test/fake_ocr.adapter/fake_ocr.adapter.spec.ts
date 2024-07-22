import { Language } from "../../../domain/language/language";
import { OcrResult_CreationInput } from "../../../domain/ocr_result/ocr_result";
import { FakeOcrTestAdapter } from "./fake_ocr.adapter";

describe("OCR Test Adapter tests", () => {
                
    const ocrTestAdapterBaseProps: OcrResult_CreationInput = {
        id: '1',
        context_resolution: {
            width: 1920,
            height: 1080,                        
        },
        results: [
            {
                text:[{ content: "recognized_text" }],
                recognition_score: 0.99,
                classification_score: 0.99,
                classification_label: 1,
                box: {
                    top_left: { x: 0, y: 0 },
                    top_right: { x: 10, y: 0 },
                    bottom_left: { x: 0, y: 10 },
                    bottom_right: { x: 10, y: 10 },
                }
            }
        ]
    };

    const language = Language.create({ name: 'japanese', two_letter_code: '' });

    const ocrTestAdapterSupportedLanguages = [ "en", "ja" ];
    

    let ocrTestAdapter: FakeOcrTestAdapter;    

    beforeEach( () => {

        ocrTestAdapter = new FakeOcrTestAdapter( ocrTestAdapterBaseProps, ocrTestAdapterSupportedLanguages );
        ocrTestAdapter.initialize();
    });

    it("should check if the test data is set", () => {
        
        expect( ocrTestAdapter.baseResultProps ).toStrictEqual( ocrTestAdapterBaseProps );
        expect( ocrTestAdapter.supportedLanguages ).toStrictEqual( ocrTestAdapterSupportedLanguages );
    });

    it("should recognize", async () => {

        const testText = "some text";

        const result = await ocrTestAdapter.recognize({            
            imageBuffer: Buffer.from(testText),
            language,
        });

        const regionResults = result?.ocr_regions[0].results;
        expect( regionResults ).toBeDefined();

        if ( !regionResults ) return;
        
        expect( result?.context_resolution ).toStrictEqual( ocrTestAdapterBaseProps.context_resolution );
        expect( regionResults[0].recognition_score ).toStrictEqual( ocrTestAdapterBaseProps.results?.[0].recognition_score );
        expect( regionResults[0].box ).toStrictEqual( ocrTestAdapterBaseProps.results?.[0].box );
        expect( regionResults[0].text[0].content ).toStrictEqual( testText );        
    });
    
    it("should get adapter supported languages", async () => {
        
        const result = await ocrTestAdapter.getSupportedLanguages();

        expect( result ).toStrictEqual( ocrTestAdapterSupportedLanguages );
    });
});