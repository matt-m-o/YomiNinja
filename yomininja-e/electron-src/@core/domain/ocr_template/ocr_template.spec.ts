import { OcrTargetRegion, OcrTargetRegionCreationInput } from "./ocr_target_region/ocr_target_region";
import { OcrTemplate, OcrTemplateCreationInput } from "./ocr_template";


describe( 'OcrTemplate tests', () => {

    let targetRegion1: OcrTargetRegion;
    let targetRegion2: OcrTargetRegion;


    beforeEach( () => {

        targetRegion1 = OcrTargetRegion.create({
            position: {
                left: 0.50,
                top: 0.50,
            },
            size: {
                width: 0.25,
                height: 0.10,
            }
        });

        targetRegion2 = OcrTargetRegion.create({
            position: {
                left: 0.50,
                top: 0.40,
            },
            size: {
                width: 0.25,
                height: 0.10,
            }
        });
    });


    it('should create a OcrTemplate', () => {

        const props: OcrTemplateCreationInput = {
            name: 'default',
            image: Buffer.from(''),
        };

        const targetTemplate = OcrTemplate.create( props );

        expect( targetTemplate.id ).toBeDefined();
        expect( targetTemplate.image ).toStrictEqual( props.image );

    });

    it('should add target regions to a OcrTemplate', () => {

        const targetTemplate = OcrTemplate.create({
            name: 'custom',
            image: Buffer.from(''),
        });

        targetTemplate.addTargetRegion( targetRegion1 );
        targetTemplate.addTargetRegion( targetRegion2 );

        expect( targetTemplate.target_regions ).toContain( targetRegion1 );
        expect( targetTemplate.target_regions ).toContain( targetRegion2 );
    });


    it('should not add a duplicate region to an OcrTemplate', () => {

        const targetTemplate = OcrTemplate.create({
            name: 'custom',
            image: Buffer.from(''),
        });

        targetTemplate.addTargetRegion( targetRegion1 );
        targetTemplate.addTargetRegion( targetRegion1 );

        expect( targetTemplate.target_regions ).toHaveLength(1);
    });
});