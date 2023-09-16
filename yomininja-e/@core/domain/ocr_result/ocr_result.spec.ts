import { OcrResult, OcrResultProperties } from "./ocr_result";


describe( "OCR Result tests", () => {

    it( "should define an OCR Result without props", () => {

        const ocrResult = OcrResult.create({
            id: 1
        });

        expect( ocrResult.id ).toStrictEqual( 1 );
        expect( ocrResult.contextResolution ).toBeUndefined();        
        expect( ocrResult.results ).toHaveLength( 0 );
    });

    it( "should define an OCR Result with props", () => {

        const id = 1;
        const props: OcrResultProperties = {
            context_resolution: {
                width: 1920,
                height: 1080,
            },
            results: [
                {
                    text: "text",
                    score: 0.99,
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
            id,
            props
        });

        expect( ocrResult.id ).toStrictEqual( id );
        expect( ocrResult.contextResolution ).toStrictEqual( props.context_resolution );
        expect( ocrResult.results ).toHaveLength( 1 );
        expect( ocrResult.results[0] ).toStrictEqual( props.results[0] );
    });

    it( "should define an OCR Result without props and set properties", () => {

        const id = 1;
        const props: OcrResultProperties = {
            context_resolution: {
                width: 1920,
                height: 1080,
            },
            results: [
                {
                    text: "text",
                    score: 0.99,
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
            id,            
        });

        ocrResult.contextResolution = props.context_resolution;
        
        props.results.map( item => ocrResult.addResultItem( item ) );

        expect( ocrResult.id ).toStrictEqual( id );
        expect( ocrResult.contextResolution ).toStrictEqual( props.context_resolution );
        expect( ocrResult.results ).toHaveLength( 1 );
        expect( ocrResult.results[0] ).toStrictEqual( props.results[0] );
    });
});