import { DataSource, Repository } from 'typeorm';
import { OcrTargetRegion } from '../../../../../domain/ocr_template/ocr_target_region/ocr_target_region';
import { OcrTargetRegionRepository } from '../../../../../domain/ocr_template/ocr_target_region/ocr_target_region.repository';
import { OcrTargetRegionTypeOrmSchema } from './ocr_target_region.schema';
import OcrTargetRegionTypeOrmRepository from './ocr_target_region.typeorm.repository';
import { OcrTemplateTypeOrmSchema } from '../ocr_template.schema';
import { OcrTemplate } from '../../../../../domain/ocr_template/ocr_template';


describe( "OcrTargetRegion TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< OcrTargetRegion >;
    let repo: OcrTargetRegionRepository;

    let ocrTemplate: OcrTemplate;
    let ocrTargetRegion: OcrTargetRegion;

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
        ormRepo = dataSource.getRepository( OcrTargetRegion );
        
        // actual repository
        repo = new OcrTargetRegionTypeOrmRepository( ormRepo );

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

        await repo.insert( ocrTargetRegion );

        const foundRegion = await ormRepo.findOneBy({ id: ocrTargetRegion.id });

        expect( foundRegion ).toStrictEqual( ocrTargetRegion );
    });

    it('should update', async () => {

        await ormRepo.save( ocrTargetRegion );


        ocrTargetRegion.position = {
            left: 0.7,
            top: 0.7,
        };
        await repo.update( ocrTargetRegion );

        const foundRegion = await ormRepo.findOneBy({ id: ocrTargetRegion.id });

        expect( foundRegion?.position ).toStrictEqual( ocrTargetRegion.position );
    });

    it('should find ONE by id', async () => {

        const ocrTargetRegion2 = OcrTargetRegion.create({
            ...ocrTargetRegion,
            id: 'asdf',
            position: {
                top: 0.1,
                left: 0.1,
            }
        });
        await ormRepo.save([
            ocrTargetRegion,
            ocrTargetRegion2
        ]);

        const foundById = await repo.findOne({ id: ocrTargetRegion2.id });

        expect( foundById ).toStrictEqual( ocrTargetRegion2 );
    });

    it('should find ALL', async () => {

        const ocrTargetRegion2 = OcrTargetRegion.create({
            ...ocrTargetRegion,
            id: 'asdf',
            position: {
                top: 0.1,
                left: 0.1,
            }
        });
        await ormRepo.save([
            ocrTargetRegion,
            ocrTargetRegion2
        ]);        

        const foundPresets = await repo.getAll();        

        expect( foundPresets ).toHaveLength( 2 );
        expect( foundPresets[0] ).toStrictEqual( ocrTargetRegion );
        expect( foundPresets[1] ).toStrictEqual( ocrTargetRegion2 );
    });

    it('should delete one', async () => {

        await ormRepo.save( ocrTargetRegion );

        await repo.delete( ocrTargetRegion.id );

        const foundPreset = await repo.findOne({ id: ocrTargetRegion.id });
        
        expect( foundPreset ).toBeFalsy();        
    });
})