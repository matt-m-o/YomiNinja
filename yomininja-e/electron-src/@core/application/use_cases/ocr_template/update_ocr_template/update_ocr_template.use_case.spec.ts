import { DataSource } from 'typeorm';
import OcrTemplateTypeOrmRepository from "../../../../infra/db/typeorm/ocr_template/ocr_template.typeorm.repository";
import OcrTargetRegionTypeOrmRepository from "../../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.typeorm.repository";
import { OcrTemplate } from "../../../../domain/ocr_template/ocr_template";
import { OcrTargetRegion, OcrTargetRegionCreationInput } from "../../../../domain/ocr_template/ocr_target_region/ocr_target_region";
import { OcrTemplateTypeOrmSchema } from '../../../../infra/db/typeorm/ocr_template/ocr_template.schema';
import { OcrTargetRegionTypeOrmSchema } from '../../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.schema';
import { UpdateOcrTemplateUseCase, UpdateOcrTemplate_Input } from './update_ocr_template.use_case';


describe("UpdateOcrTemplateUseCase tests", () => {    
        
    let useCase: UpdateOcrTemplateUseCase;

    let ocrTemplateRepo: OcrTemplateTypeOrmRepository;
    let ocrTargetRegionRepo: OcrTargetRegionTypeOrmRepository;

    let ocrTemplate: OcrTemplate;

    let ocrTargetRegion: OcrTargetRegion;

    beforeEach( async () => {

        const dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                OcrTemplateTypeOrmSchema,
                OcrTargetRegionTypeOrmSchema
            ],
        });

        await dataSource.initialize();

        ocrTemplateRepo = new OcrTemplateTypeOrmRepository(
            dataSource.getRepository( OcrTemplate )
        );

        ocrTargetRegionRepo = new OcrTargetRegionTypeOrmRepository(
            dataSource.getRepository( OcrTargetRegion )
        );

        useCase = new UpdateOcrTemplateUseCase({
            ocrTemplateRepo,
            ocrTargetRegionRepo
        });
        

        ocrTemplate = OcrTemplate.create({
            image: Buffer.from( '' ),
            name: 'template1',
        });

        await ocrTemplateRepo.insert( ocrTemplate );

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

    it("should update an ocr template adding a target region", async () => {

        ocrTemplate.name = 'template2';
        ocrTemplate.addTargetRegion( ocrTargetRegion );

        const input: UpdateOcrTemplate_Input = {
            template: ocrTemplate
        };

        await useCase.execute( input );

        const foundTemplate = await ocrTemplateRepo.findOne({ id: ocrTemplate.id });
        if ( foundTemplate )
            ocrTemplate.updated_at = foundTemplate.updated_at;

        expect( foundTemplate ).toStrictEqual( ocrTemplate );
        expect( foundTemplate?.target_regions ).toHaveLength( 1 );
    });
    
    it("should update an ocr template including existing target region", async () => {

        ocrTemplate.addTargetRegion( ocrTargetRegion );
        await useCase.execute({
            template: ocrTemplate
        });


        ocrTargetRegion.position = {
            top: ocrTargetRegion.position.top * 0.5,
            left: ocrTargetRegion.position.left * 0.5,
        }
        ocrTemplate.updateTargetRegion( ocrTargetRegion );
        ocrTemplate.name = 'template2';
        const input: UpdateOcrTemplate_Input = {
            template: ocrTemplate
        };
        await useCase.execute( input );
        
        const foundTemplate = await ocrTemplateRepo.findOne({ id: ocrTemplate.id });
        if ( foundTemplate )
            ocrTemplate.updated_at = foundTemplate.updated_at;

        expect( foundTemplate ).toStrictEqual( ocrTemplate );
        expect( foundTemplate?.target_regions ).toHaveLength( 1 );
    });


    it("should update an ocr template removing existing target region", async () => {

        ocrTemplate.addTargetRegion( ocrTargetRegion );
        await useCase.execute({
            template: ocrTemplate
        });


        ocrTemplate.removeTargetRegion( ocrTargetRegion.id );
        ocrTemplate.name = 'template3';
        const input: UpdateOcrTemplate_Input = {
            template: ocrTemplate
        };
        await useCase.execute( input );
        
        const foundTemplate = await ocrTemplateRepo.findOne({ id: ocrTemplate.id });
        if ( foundTemplate )
            ocrTemplate.updated_at = foundTemplate.updated_at;

        expect( foundTemplate ).toStrictEqual( ocrTemplate );
        expect( foundTemplate?.target_regions ).toHaveLength( 0 );
    });
});