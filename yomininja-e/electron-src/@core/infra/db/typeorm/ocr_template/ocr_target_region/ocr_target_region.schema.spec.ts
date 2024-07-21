import { DataSource, Repository } from 'typeorm';
import { OcrTargetRegion } from '../../../../../domain/ocr_template/ocr_target_region/ocr_target_region';
import { OcrTargetRegionTypeOrmSchema } from './ocr_target_region.schema';
import { OcrTemplateTypeOrmSchema } from '../ocr_template.schema';
import { OcrTemplate } from '../../../../../domain/ocr_template/ocr_template';

describe( 'OcrTargetRegion Entity Schema tests', () => {

    let dataSource: DataSource;
    let OcrTargetRegionTypeOrmRepo: Repository< OcrTargetRegion >;

    let ocrTargetRegion: OcrTargetRegion;

    let ocrTemplate: OcrTemplate;

    beforeEach( async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ 
                OcrTemplateTypeOrmSchema,
                OcrTargetRegionTypeOrmSchema,
            ],
        });

        await dataSource.initialize();

        ocrTemplate = OcrTemplate.create({
            image: Buffer.from( '' ),
            name: 'template1',
        });
        await dataSource.getRepository( OcrTemplate )
            .save( ocrTemplate );

        ocrTargetRegion = OcrTargetRegion.create({
            ocr_template_id: ocrTemplate.id,
            position: {
                left: 0.50,
                top: 0.50,
            },
            size: {
                width: 0.25,
                height: 0.10,
            },
            auto_ocr_options: {
                enabled: false,
                motion_sensitivity: 300_000,
                refresh_all_regions: false
            }
        });

        OcrTargetRegionTypeOrmRepo = dataSource.getRepository( OcrTargetRegion );
    });

    it("should insert", async () => {        
        
        await OcrTargetRegionTypeOrmRepo.save(ocrTargetRegion);

        const foundRegion = await OcrTargetRegionTypeOrmRepo.findOneBy({ id: ocrTargetRegion.id });

        expect( foundRegion ).toBeDefined();
        expect( foundRegion?.id ).toStrictEqual( ocrTargetRegion.id );
        expect( foundRegion ).toStrictEqual( ocrTargetRegion );

    });


    it('should update', async () => {
                
        await OcrTargetRegionTypeOrmRepo.save( ocrTargetRegion );

        const updatedPosition = {
            left: ocrTargetRegion.position.left * 0.10,
            top: ocrTargetRegion.position.left * 0.10,
        };
        ocrTargetRegion.position = updatedPosition;
        
        await OcrTargetRegionTypeOrmRepo.save( ocrTargetRegion );

        const foundPreset = await OcrTargetRegionTypeOrmRepo.findOneBy( { id: ocrTargetRegion.id } );

        expect( foundPreset).toBeDefined();
        expect( foundPreset?.position ).toStrictEqual( updatedPosition );
    });
});