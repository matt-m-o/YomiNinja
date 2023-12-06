import { OcrTargetRegion } from "../../../domain/ocr_template/ocr_target_region/ocr_target_region";
import { OcrTargetRegionRepository } from "../../../domain/ocr_template/ocr_target_region/ocr_target_region.repository";
import { OcrTemplate, OcrTemplateJson } from "../../../domain/ocr_template/ocr_template";
import { OcrTemplateRepository } from "../../../domain/ocr_template/ocr_template.repository";


export interface UpdateOcrTemplate_Input {
    template: OcrTemplateJson;
};

export class UpdateOcrTemplateUseCase {

    public ocrTemplateRepo: OcrTemplateRepository;
    public ocrTargetRegionRepo: OcrTargetRegionRepository;

    constructor( input: {
        ocrTemplateRepo: OcrTemplateRepository,
        ocrTargetRegionRepo: OcrTargetRegionRepository,
    }) {
        this.ocrTemplateRepo = input.ocrTemplateRepo;
        this.ocrTargetRegionRepo = input.ocrTargetRegionRepo;
    }

    async execute( input: UpdateOcrTemplate_Input ): Promise< void > {

        const template = await this.ocrTemplateRepo.findOne({ id: input.template.id });

        if ( !template ) {
            console.log(`ocr template not found: ${input.template.id}`);
            return;
        }

        const changedRegions = input.template.target_regions.filter( item => {

            const regionExists = template.getTargetRegion( item.id );

            return Boolean( regionExists );
        });

        const newRegions = input.template.target_regions.filter( item => {

            const regionExists = template.getTargetRegion( item.id );

            return !Boolean( regionExists );
        });

        const removedRegions = template.target_regions.filter( region => {

            const regionExists = input.template.target_regions.some( r => r.id === region.id  );

            return !Boolean( regionExists );
        });


        for ( const regionData of changedRegions ) {

            const region = new OcrTargetRegion(regionData);
            template.updateTargetRegion( region  );
            
            await this.ocrTargetRegionRepo.update( region );
        }
        
        for ( const regionData of newRegions ) {

            const region = new OcrTargetRegion(regionData);
            template.addTargetRegion( region );

            await this.ocrTargetRegionRepo.insert( region );
        }

        for ( const region of removedRegions ) {

            template.removeTargetRegion( region.id );
            await this.ocrTargetRegionRepo.delete( region.id );
        }

        template.name = input.template.name;
        template.image = input.template.image;
        template.capture_source_name = input.template.capture_source_name;

        await this.ocrTemplateRepo.update( template );
    }
}