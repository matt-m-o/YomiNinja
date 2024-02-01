import { OcrTargetRegion, OcrTargetRegionCreationInput } from "./ocr_target_region/ocr_target_region";
import { OcrTemplate, OcrTemplateCreationInput } from "./ocr_template";


describe( 'OcrTemplate tests', () => {

    let targetRegion1: OcrTargetRegion;
    let targetRegion2: OcrTargetRegion;

    const ocrTemplateId = 1;

    beforeEach( () => {

        targetRegion1 = OcrTargetRegion.create({
            ocr_template_id: ocrTemplateId,
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
            ocr_template_id: ocrTemplateId,
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

        const template = OcrTemplate.create( props );

        expect( template.name ).toStrictEqual( props.name );
        expect( template.image ).toStrictEqual( props.image );

    });

    it('should add target regions to a OcrTemplate', () => {

        const template = OcrTemplate.create({
            id: ocrTemplateId,
            name: 'custom',
            image: Buffer.from(''),
        });

        template.addTargetRegion( targetRegion1 );
        template.addTargetRegion( targetRegion2 );

        expect( template.target_regions ).toContainEqual( targetRegion1 );
        expect( template.target_regions ).toContainEqual( targetRegion2 );
        expect( template.target_regions[0].ocr_template_id )
            .toStrictEqual( targetRegion1.ocr_template_id );
    });


    it('should not add a duplicate region to an OcrTemplate', () => {

        const targetTemplate = OcrTemplate.create({
            name: 'custom',
            image: Buffer.from('')
        });

        targetTemplate.addTargetRegion( targetRegion1 );
        targetTemplate.addTargetRegion( targetRegion1 );

        expect( targetTemplate.target_regions ).toHaveLength(1);
    });
});