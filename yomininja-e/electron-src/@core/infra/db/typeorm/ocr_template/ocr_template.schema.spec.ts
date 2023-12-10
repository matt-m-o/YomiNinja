import { DataSource, Repository } from 'typeorm';
import { OcrTemplate } from '../../../../domain/ocr_template/ocr_template';
import { OcrTemplateTypeOrmSchema } from './ocr_template.schema';
import { OcrTargetRegion } from '../../../../domain/ocr_template/ocr_target_region/ocr_target_region';
import { OcrTargetRegionTypeOrmSchema } from './ocr_target_region/ocr_target_region.schema';

describe( 'OcrTemplate Entity Schema tests', () => {

    let dataSource: DataSource;
    let ocrTemplateTypeOrmRepo: Repository< OcrTemplate >;
    let targetRegion1: OcrTargetRegion;

    const relations = [
        'target_regions'
    ];

    const ocrTemplateId = 1;

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

        ocrTemplateTypeOrmRepo = dataSource.getRepository( OcrTemplate );
        const ocrTargetRegionTypeOrmRepo = dataSource.getRepository( OcrTargetRegion );

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
        await ocrTargetRegionTypeOrmRepo.insert( targetRegion1 );
        // const insertTargetRegion1 = await ocrTargetRegionTypeOrmRepo.findOneBy({ id: targetRegion1.id });
        // targetRegion1 = insertTargetRegion1 || targetRegion1;

        // console.log(targetRegion1);
        // console.log(insertTargetRegion1);
    });

    it("should insert", async () => {

        const ocrTemplate = OcrTemplate.create({
            id: ocrTemplateId,
            image: Buffer.from(''),
            name: 'template1'
        });
        ocrTemplate.addTargetRegion( targetRegion1 );
        
        await ocrTemplateTypeOrmRepo.save(ocrTemplate);

        const foundTemplate = await ocrTemplateTypeOrmRepo.findOne({
            where: {
                id: ocrTemplate.id
            },
            relations
        });

        expect( foundTemplate ).toBeDefined();

        if ( !foundTemplate ) return; 

        foundTemplate.updated_at = ocrTemplate.updated_at;
        
        // console.log( foundTemplate );

        expect( foundTemplate?.id ).toStrictEqual( ocrTemplate.id );
        expect( foundTemplate ).toStrictEqual( ocrTemplate ); // Relations date properties fails
    });

    it("should insert with target regions", async () => {

        const ocrTemplate = OcrTemplate.create({
            image: Buffer.from(''),
            name: 'template1',
            target_regions: [ targetRegion1 ]
        });        
        
        await ocrTemplateTypeOrmRepo.save(ocrTemplate);

        const foundTemplate = await ocrTemplateTypeOrmRepo.findOne({
            where: {
                id: ocrTemplate.id
            },
            relations
        });

        expect( foundTemplate ).toBeDefined();

        if ( !foundTemplate ) return; 

        foundTemplate.updated_at = ocrTemplate.updated_at;

        expect( foundTemplate?.id ).toStrictEqual( ocrTemplate.id );
        expect( foundTemplate.target_regions ).toHaveLength( 1 ); // Relations date properties fails

        const targetRegion = foundTemplate.target_regions[0];
        expect( targetRegion.id ).toStrictEqual( targetRegion1.id );
    });


    it('should update', async () => {        
        
        const ocrTemplate = OcrTemplate.create({
            id: ocrTemplateId,
            name: 'template1',
            image: Buffer.from(''),
        });
        ocrTemplate.addTargetRegion( targetRegion1 );
        const created_at = ocrTemplate.created_at;
        const updatedAt = ocrTemplate.updated_at;
                
        await ocrTemplateTypeOrmRepo.save( ocrTemplate );

        const updatedName = 'New Name';
        ocrTemplate.name = updatedName;
        
        await ocrTemplateTypeOrmRepo.save( ocrTemplate );

        const foundTemplate = await ocrTemplateTypeOrmRepo.findOneBy( { id: ocrTemplate.id } );

        
        expect( foundTemplate).toBeDefined();
        expect( foundTemplate?.name === updatedName ).toBeTruthy();
        expect( foundTemplate?.created_at).toStrictEqual( ocrTemplate.created_at );
        expect( foundTemplate?.updated_at.getTime() !== updatedAt.getTime() ).toBeTruthy();
    });
});