import { OcrResult, OcrResult_CreationInput } from "../ocr_result/ocr_result";
import { OcrResultScalable, OcrResultScalable_CreationInput } from "./ocr_result_scalable";



describe( "OCRResultScalable tests", () => {

    let ocrResult: OcrResult;

    beforeEach( () => {

        const input: OcrResult_CreationInput = {
            id: 1,
            context_resolution: {
                width: 1920,
                height: 1080,
            },
            results: [
                { // Normal box
                    text: "normal text",
                    score: 0.99,
                    box: {
                        top_left: { x: 192, y: 108 },
                        top_right: { x: 384, y: 108 },
                        bottom_left: { x: 192, y: 216 },
                        bottom_right: { x: 384, y: 216 }
                    }
                },
                { // Tilted box
                    text: "tilted_text",
                    score: 0.99,
                    box: {
                        top_left: { x: 0, y: 0 },
                        top_right: { x: 192, y: 54 },
                        bottom_left: { x: 0, y: 108 },
                        bottom_right: { x: 180, y: 162 }
                    }
                }
            ]
        }

        ocrResult = OcrResult.create(input);
    });

    it( "should define an OCRResultScalable without props", () => {

        const ocrResult = OcrResultScalable.create({
            id: 1,
        });

        expect( ocrResult.id ).toStrictEqual( 1 );
        expect( ocrResult.context_resolution ).toStrictEqual({ width: 0, height: 0 });        
        expect( ocrResult.results ).toHaveLength( 0 );
    });

    it( "should define an OCRResultScalable from OcrResult instance", () => {
        
        const ocrResultScalable = OcrResultScalable.createFromOcrResult( ocrResult );

        expect( ocrResultScalable.id ).toStrictEqual( ocrResult.id );
        expect( ocrResultScalable.context_resolution ).toStrictEqual( ocrResult.context_resolution );
        expect( ocrResultScalable.results ).toHaveLength( 2 );

        const normal_item = ocrResultScalable.results[0];

        expect( normal_item.box.position?.left.toPrecision(2) ).toStrictEqual( "10" );
        expect( normal_item.box.position?.top.toPrecision(2) ).toStrictEqual( "10" );
        expect( normal_item.box.dimensions?.width ).toStrictEqual( 10 );
        expect( normal_item.box.dimensions?.height ).toStrictEqual( 10 );
        expect( normal_item.box.angle_degrees ).toStrictEqual( 0 );
        

        const tilted_item = ocrResultScalable.results[1]; console.log( tilted_item );

        expect( tilted_item.box.position?.left ).toStrictEqual( 0 );
        expect( tilted_item.box.position?.top ).toStrictEqual( 0 );
        expect( Number( tilted_item.box.dimensions?.width ) > 10 ).toBeTruthy();
        expect( Number( tilted_item.box.dimensions?.width ) < 11 ).toBeTruthy();
        expect( tilted_item.box.dimensions?.height ).toStrictEqual( 10 );
        expect( tilted_item.box.angle_degrees?.toPrecision(3) ).toStrictEqual( "15.7" );
    });
    
});