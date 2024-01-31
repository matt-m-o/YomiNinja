import { DataSource } from 'typeorm';
import OcrTemplateTypeOrmRepository from "../../../../infra/db/typeorm/ocr_template/ocr_template.typeorm.repository";
import { OcrTemplate } from "../../../../domain/ocr_template/ocr_template";
import { OcrTemplateTypeOrmSchema } from '../../../../infra/db/typeorm/ocr_template/ocr_template.schema';
import { OcrTargetRegionTypeOrmSchema } from '../../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.schema';
import { DeleteOcrTemplateUseCase, DeleteOcrTemplate_Input } from './delete_ocr_template.use_case';
import { OcrTargetRegion } from '../../../../domain/ocr_template/ocr_target_region/ocr_target_region';


describe("DeleteOcrTemplateUseCase tests", () => {    
        
    let useCase: DeleteOcrTemplateUseCase;

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

        useCase = new DeleteOcrTemplateUseCase({ ocrTemplateRepo });

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

    it("should delete an ocr template", async () => {

        const input: DeleteOcrTemplate_Input = { id: ocrTemplate.id };

        await useCase.execute( input );

        const template = await ocrTemplateRepo.findOne({ id: input.id });

        expect( template ).toBeFalsy();
    });
    
});