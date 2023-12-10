import { DataSource } from 'typeorm';
import { FakeOcrTestAdapter } from "../../../../infra/test/fake_ocr.adapter/fake_ocr.adapter";
import { CreateOcrTemplateUseCase, CreateOcrTemplate_Input } from "./create_ocr_template.use_case";
import OcrTemplateTypeOrmRepository from "../../../../infra/db/typeorm/ocr_template/ocr_template.typeorm.repository";
import OcrTargetRegionTypeOrmRepository from "../../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.typeorm.repository";
import { OcrTemplate } from "../../../../domain/ocr_template/ocr_template";
import { OcrTargetRegion, OcrTargetRegionCreationInput, OcrTargetRegionJson } from "../../../../domain/ocr_template/ocr_target_region/ocr_target_region";
import { OcrTemplateTypeOrmSchema } from '../../../../infra/db/typeorm/ocr_template/ocr_template.schema';
import { OcrTargetRegionTypeOrmSchema } from '../../../../infra/db/typeorm/ocr_template/ocr_target_region/ocr_target_region.schema';


describe("CreateOcrTemplateUseCase tests", () => {    
        
    let useCase: CreateOcrTemplateUseCase;

    let ocrTemplateRepo: OcrTemplateTypeOrmRepository;
    let ocrTargetRegionRepo: OcrTargetRegionTypeOrmRepository;

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

        useCase = new CreateOcrTemplateUseCase({
            ocrTemplateRepo,
            ocrTargetRegionRepo
        });
        
    });

    it("should create an ocr template", async () => {        

        const input: CreateOcrTemplate_Input = {
            image: Buffer.from('asdf'),
            name: 'template1'
        };

        const output = await useCase.execute(input);
        
        const foundTemplate = await ocrTemplateRepo.findOne({
            name: input.name
        });

        expect( output ).toStrictEqual( output );

        expect( foundTemplate?.name ).toStrictEqual( input.name );
        expect( foundTemplate?.image )
            .toStrictEqual( input.image );
    });
    
});