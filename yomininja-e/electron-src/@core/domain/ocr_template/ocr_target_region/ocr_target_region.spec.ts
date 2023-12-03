import { OcrTargetRegion, OcrTargetRegionCreationInput } from "./ocr_target_region";


describe( 'OcrTargetRegion tests', () => {


    it('should create a OcrTargetRegion', () => {

        const props: OcrTargetRegionCreationInput = {
            position: {
                left: 50,
                top: 50,
            },
            size: {
                width: 100,
                height: 10,
            }
        };

        const targetRegion = OcrTargetRegion.create( props );

        expect( targetRegion.id ).toBeDefined();
        expect( targetRegion.position ).toStrictEqual( props.position );
        expect( targetRegion.size ).toStrictEqual( props.size );
    });
});