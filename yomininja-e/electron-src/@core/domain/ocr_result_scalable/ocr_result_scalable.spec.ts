import { OcrResult, OcrResult_CreationInput } from "../ocr_result/ocr_result";
import { OcrResultScalable, OcrResultScalable_CreationInput } from "./ocr_result_scalable";



describe( "OCRResultScalable tests", () => {


    let ocrResultCreationInput: OcrResult_CreationInput
    let ocrResult: OcrResult;

    beforeEach( () => {

        ocrResultCreationInput = {
            id: '1',
            context_resolution: {
                width: 1920,
                height: 1080,
            },
            results: [
                { // Normal box
                    text:[{ content: "normal text" }],
                    recognition_score: 0.99,
                    classification_score: 0.99,
                    classification_label: 1,
                    box: {
                        top_left: { x: 192, y: 108 },
                        top_right: { x: 384, y: 108 },
                        bottom_left: { x: 192, y: 216 },
                        bottom_right: { x: 384, y: 216 }
                    }
                },
                { // Tilted box
                    text:[{ content: "tilted_text" }],
                    recognition_score: 0.99,
                    classification_score: 0.99,
                    classification_label: 1,
                    box: {
                        top_left: { x: 0, y: 0 },
                        top_right: { x: 192, y: 54 },
                        bottom_left: { x: 0, y: 108 },
                        bottom_right: { x: 180, y: 162 }
                    }
                }
            ]
        }

        ocrResult = OcrResult.create( ocrResultCreationInput );
    });

    it( "should define an OCRResultScalable without props", () => {

        const ocrResult = OcrResultScalable.create({
            id: '1',
        });


        expect( ocrResult ).toBeTruthy();
        if ( !ocrResult ) return;

        expect( ocrResult.id ).toStrictEqual( 1 );
        expect( ocrResult.context_resolution ).toStrictEqual({ width: 0, height: 0 });        
        expect( ocrResult.ocr_regions ).toHaveLength( 0 );
    });

    it( "should define an OCRResultScalable from OcrResult instance", () => {
        
        const ocrResultScalable = OcrResultScalable.createFromOcrResult( ocrResult );

        const ocr_region = ocrResultScalable.ocr_regions[0];

        expect( ocrResultScalable.id ).toStrictEqual( ocrResult.id );
        expect( ocrResultScalable.context_resolution ).toStrictEqual( ocrResult.context_resolution );
        expect( ocr_region.results ).toHaveLength( 2 );

        const normal_item = ocr_region.results[0];
        // console.log( normal_item );

        expect( normal_item.box.position?.left.toPrecision(2) ).toStrictEqual( "10" );
        expect( normal_item.box.position?.top.toPrecision(2) ).toStrictEqual( "10" );
        expect( normal_item.box.dimensions?.width ).toStrictEqual( 10 );
        expect( normal_item.box.dimensions?.height ).toStrictEqual( 10 );
        expect( normal_item.box.angle_degrees ).toStrictEqual( 0 );
        

        const tilted_item = ocr_region.results[1]; console.log( tilted_item );

        expect( tilted_item.box.position?.left ).toStrictEqual( 0 );
        expect( tilted_item.box.position?.top ).toStrictEqual( 0 );
        expect( Number( tilted_item.box.dimensions?.width ) > 10 ).toBeTruthy();
        expect( Number( tilted_item.box.dimensions?.width ) < 11 ).toBeTruthy();
        expect( tilted_item.box.dimensions?.height ).toStrictEqual( 10 );
        expect( tilted_item.box.angle_degrees?.toPrecision(3) ).toStrictEqual( "15.7" );
    });


    it('should add a region result', () => {

        if ( !ocrResultCreationInput?.results?.[0] )
            return;

        const ocrResultScalable = OcrResultScalable.createFromOcrResult(ocrResult);
        ocrResultScalable.ocr_regions = [];

        const ocrRegionResult = OcrResult.create({
            id: '2',
            context_resolution: {
                width: 960,
                height: 540,
            },
            results: [ ocrResultCreationInput.results[0] ]
        });
        const ocrRegionScalableResult = OcrResultScalable.createFromOcrResult(ocrRegionResult);


        const regionWidthPct = ocrRegionResult.context_resolution.width / ocrResultScalable.context_resolution.width;
        const regionHeightPct = ocrRegionResult.context_resolution.height / ocrResultScalable.context_resolution.height;


        ocrResultScalable.addRegionResult({
            regionResult: ocrRegionScalableResult,
            regionPosition: {
                top: 0.5,
                left: 0.5,
            },
            regionSize: {
                width: regionWidthPct,
                height: regionHeightPct,
            },
            globalScaling: true
        });


        const normal_item = ocrResultScalable.ocr_regions[0].results[0];
        expect( normal_item.box.position?.left.toPrecision(2) ).toStrictEqual( "60" );
        expect( normal_item.box.position?.top.toPrecision(2) ).toStrictEqual( "60" );
        expect( normal_item.box.dimensions?.width ).toStrictEqual( 10 );
        expect( normal_item.box.dimensions?.height ).toStrictEqual( 10 );
        expect( normal_item.box.angle_degrees ).toStrictEqual( 0 );
    });
    
});