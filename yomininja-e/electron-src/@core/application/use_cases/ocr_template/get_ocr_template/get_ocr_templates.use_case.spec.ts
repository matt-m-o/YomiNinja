import { DataSource } from 'typeorm';
import OcrTemplateTypeOrmRepository from "../../../../infra/db/typeorm/ocr_template/ocr_template.typeorm.repository";
import OcrTargetRegionTypeOrmRepository from "../../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.typeorm.repository";
import { OcrTemplate } from "../../../../domain/ocr_template/ocr_template";
import { OcrTargetRegion, OcrTargetRegionCreationInput } from "../../../../domain/ocr_template/ocr_target_region/ocr_target_region";
import { OcrTemplateTypeOrmSchema } from '../../../../infra/db/typeorm/ocr_template/ocr_template.schema';
import { OcrTargetRegionTypeOrmSchema } from '../../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.schema';
import { GetOcrTemplatesUseCase, GetOcrTemplates_Input } from './get_ocr_templates.use_case';


describe("GetOcrTemplatesUseCase tests", () => {    
        
    let useCase: GetOcrTemplatesUseCase;

    let ocrTemplateRepo: OcrTemplateTypeOrmRepository;

    let ocrTemplate: OcrTemplate;
    let ocrTemplate2: OcrTemplate;

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
            dataSource.getRepository( OcrTemplate ),
            dataSource.getRepository( OcrTargetRegion )
        );

        useCase = new GetOcrTemplatesUseCase({ ocrTemplateRepo });

        ocrTemplate = OcrTemplate.create({
            image: Buffer.from( '' ),
            name: 'template1',
            capture_source_name: 'window title 1'
        });

        await ocrTemplateRepo.insert( ocrTemplate );

        ocrTemplate2 = OcrTemplate.create({
            image: Buffer.from(''),
            name: 'template2',
            capture_source_name: 'window title 2'
        });
        await ocrTemplateRepo.insert( ocrTemplate2);
    });

    it("should find all ocr templates with the same capture source", async () => {

        const input: GetOcrTemplates_Input = {
            capture_source_name: ocrTemplate.capture_source_name
        };

        const output = await useCase.execute( input );

        expect( output ).toContainEqual( ocrTemplate );
        expect( output ).toHaveLength( 1 );
    });
    
    it("should find all ocr templates with a similar name", async () => {

        const input: GetOcrTemplates_Input = {
            name: 'template'
        };

        const output = await useCase.execute( input );

        expect( output ).toContainEqual( ocrTemplate );
        expect( output ).toContainEqual( ocrTemplate2 );
        
        expect( output ).toHaveLength( 2 );
    });


    it("should find ocr template by ID", async () => {

        const input: GetOcrTemplates_Input = {
            id: ocrTemplate2.id
        };

        const output = await useCase.execute( input );

        expect( output ).toContainEqual( ocrTemplate2 );        
        expect( output ).toHaveLength( 1 );
    });

    it("should get all ocr templates", async () => {

        const input: GetOcrTemplates_Input = {};

        const output = await useCase.execute( input );

        expect( output ).toHaveLength( 2 );
    });
});