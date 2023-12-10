import { DataSource, Repository } from 'typeorm';
import { OcrTemplate } from '../../../../domain/ocr_template/ocr_template';
import { OcrTemplateRepository } from '../../../../domain/ocr_template/ocr_template.repository';
import { OcrTargetRegion } from '../../../../domain/ocr_template/ocr_target_region/ocr_target_region';
import { OcrTemplateTypeOrmSchema } from './ocr_template.schema';
import { OcrTargetRegionTypeOrmSchema } from './ocr_target_region/ocr_target_region.schema';
import OcrTemplateTypeOrmRepository from './ocr_template.typeorm.repository';


describe( "OcrTemplate TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< OcrTemplate >;
    let repo: OcrTemplateRepository;

    let ocrTemplate: OcrTemplate;
    let ocrTargetRegion: OcrTargetRegion;

    const relations = [
        'target_regions'
    ];

    beforeEach( async () => {
        
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                OcrTemplateTypeOrmSchema,
                OcrTargetRegionTypeOrmSchema
            ]
        });

        await dataSource.initialize();

        // Settings Preset repository by TypeOrm
        ormRepo = dataSource.getRepository( OcrTemplate );
        
        // actual repository
        repo = new OcrTemplateTypeOrmRepository( ormRepo );

        ocrTemplate = OcrTemplate.create({
            name: 'template1',
            image: Buffer.from(''),
        });
        await dataSource.getRepository( OcrTemplate )
            .insert( ocrTemplate );

        ocrTargetRegion = OcrTargetRegion.create({
            ocr_template_id: ocrTemplate.id,
            position: {
                left: 0.50,
                top: 0.50,
            },
            size: {
                width: 0.25,
                height: 0.10,
            }
        });
    });

    it('should insert', async () => {

        await repo.insert( ocrTemplate );

        const foundTemplate = await ormRepo.findOne({
            where: {
                id: ocrTemplate.id
            },
            relations
        });

        expect( foundTemplate ).toStrictEqual( ocrTemplate );
    });

    it('should update', async () => {

        await ormRepo.save( ocrTemplate );

        ocrTemplate.name = 'template2';
        await repo.update( ocrTemplate );

        const foundTemplate = await ormRepo.findOneBy({ id: ocrTemplate.id });

        expect( foundTemplate?.name ).toStrictEqual( ocrTemplate.name );
    });

    it('should find ONE by id or name', async () => {

        const ocrTemplate2 = OcrTemplate.create({
            image: Buffer.from(''),
            name: 'template2',
        });
        await ormRepo.save([
            ocrTemplate,
            ocrTemplate2
        ]);

        const foundByName = await repo.findOne({ name: ocrTemplate.name });
        const foundById = await repo.findOne({ id: ocrTemplate2.id });

        expect( foundByName ).toStrictEqual( ocrTemplate );
        expect( foundById ).toStrictEqual( ocrTemplate2 );
    });

    it('should find MANY by name or capture source', async () => {

        const ocrTemplate2 = OcrTemplate.create({
            image: Buffer.from(''),
            name: 'template2',
            capture_source_name: 'application name'
        });
        await ormRepo.save([
            ocrTemplate,
            ocrTemplate2
        ]);

        const byName = await repo.findMany({
            name: ocrTemplate.name
        });
        const byCaptureSource = await repo.findMany({
            capture_source_name: ocrTemplate2.capture_source_name
        });

        expect( byName ).toContainEqual( ocrTemplate );
        expect( byName ).toHaveLength( 1 );
        expect( byCaptureSource ).toContainEqual( ocrTemplate2 );
        expect( byCaptureSource ).toHaveLength( 1 );
    });

    it('should get ALL', async () => {

        const ocrTemplate2 = OcrTemplate.create({
            name: 'template2',
            image: Buffer.from(''),
        });
        await ormRepo.save([
            ocrTemplate,
            ocrTemplate2
        ]);        

        const items = await repo.getAll();

        expect( items ).toHaveLength( 2 );
        expect( items[0] ).toStrictEqual( ocrTemplate );
        expect( items[1] ).toStrictEqual( ocrTemplate2 );
    });

    it('should delete one', async () => {

        await ormRepo.save( ocrTemplate );

        await repo.delete( ocrTemplate.id );

        const foundTemplate = await repo.findOne({ id: ocrTemplate.id });
        
        expect( foundTemplate ).toBeFalsy();        
    });
})