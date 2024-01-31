import { OcrTargetRegion, OcrTargetRegionCreationInput } from "./ocr_target_region";


describe( 'OcrTargetRegion tests', () => {

    let props1: OcrTargetRegionCreationInput;

    beforeEach( () => {
        props1 = {
            ocr_template_id: 1,
            position: {
                left: 0.50,
                top: 0.50,
            },
            size: {
                width: 0.25,
                height: 0.10,
            }
        };
    });

    it('should create a OcrTargetRegion', () => {

        const targetRegion = OcrTargetRegion.create( props1 );

        expect( targetRegion.id.split('/')[0] ).toStrictEqual( props1.ocr_template_id.toString() );
        expect( targetRegion.position ).toStrictEqual( props1.position );
        expect( targetRegion.size ).toStrictEqual( props1.size );
    });


    it('should convert the values from percentages to pixels', () => {

        const targetRegion = OcrTargetRegion.create( props1 );

        const imageSize = {
            width: 1000,
            height: 900,
        };

        const targetRegionPixels = targetRegion.toPixels( imageSize );
        expect( targetRegionPixels.id ).toStrictEqual( targetRegion.id )

        const { position, size } = targetRegionPixels;
        expect( position.left ).toStrictEqual( 500 );
        expect( position.top ).toStrictEqual( 450 );
        expect( size.width ).toStrictEqual( 250 );
        expect( size.height ).toStrictEqual( 90 );
    });
});