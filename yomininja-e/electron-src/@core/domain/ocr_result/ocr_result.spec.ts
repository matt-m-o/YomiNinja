import { OcrResult, OcrResultContextResolution, OcrResult_CreationInput } from "./ocr_result";


describe( "OCR Result tests", () => {

    it( "should define an OCR Result without props", () => {

        const ocrResult = OcrResult.create({
            id: '1',
        });

        expect( ocrResult.id ).toStrictEqual( 1 );
        expect( ocrResult.context_resolution ).toStrictEqual({ width: 0, height: 0 });        
        expect( ocrResult.results ).toHaveLength( 0 );
    });

    it( "should define an OCR Result with props", () => {
        
        const input: OcrResult_CreationInput = {
            id: '1',
            context_resolution: {
                width: 1920,
                height: 1080,
            },
            results: [
                {
                    text: [{ content: "text" }],
                    recognition_score: 0.99,
                    classification_score: 0.99,
                    classification_label: 1,
                    box: {
                        top_left: { x: 0, y: 0 },
                        top_right: { x: 10, y: 0 },
                        bottom_left: { x: 0, y: 10 },
                        bottom_right: { x: 10, y: 10 }
                    }
                }
            ]
        }

        const ocrResult = OcrResult.create(input);

        expect( ocrResult.id ).toStrictEqual( input.id );
        expect( ocrResult.context_resolution ).toStrictEqual( input.context_resolution );
        expect( ocrResult.results ).toHaveLength( 1 );
        expect( ocrResult.results[0] ).toStrictEqual( input?.results?.[0] );
    });

    it( "should define an OCR Result without props and set properties", () => {

        const input: OcrResult_CreationInput = {
            id: '1',
            context_resolution: {
                width: 1920,
                height: 1080,
            },
            results: [
                {
                    text:[{ content: "text" }],
                    recognition_score: 0.99,
                    classification_score: 0.99,
                    classification_label: 1,
                    box: {
                        top_left: { x: 0, y: 0 },
                        top_right: { x: 10, y: 0 },
                        bottom_left: { x: 0, y: 10 },
                        bottom_right: { x: 10, y: 10 }
                    }
                }
            ]
        }

        const ocrResult = OcrResult.create({
            id: input.id
        });

        ocrResult.context_resolution = input.context_resolution as OcrResultContextResolution;
        
        input.results?.map( item => ocrResult.addResultItem( item ) );

        expect( ocrResult.id ).toStrictEqual( input.id );
        expect( ocrResult.context_resolution ).toStrictEqual( input.context_resolution );
        expect( ocrResult.results ).toHaveLength( 1 );
        expect( ocrResult.results[0] ).toStrictEqual( input.results?.[0] );
    });
});