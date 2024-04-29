import { OcrTargetRegion } from "../../../../domain/ocr_template/ocr_target_region/ocr_target_region";
import { OcrTargetRegionRepository } from "../../../../domain/ocr_template/ocr_target_region/ocr_target_region.repository";
import { OcrTemplate, OcrTemplateJson } from "../../../../domain/ocr_template/ocr_template";
import { OcrTemplateRepository } from "../../../../domain/ocr_template/ocr_template.repository";


export interface UpdateOcrTemplate_Input extends Omit<
    OcrTemplateJson,
    'image_base64'
> {};

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

    async execute( input: UpdateOcrTemplate_Input ): Promise< OcrTemplate | undefined > {

        const template = await this.ocrTemplateRepo.findOne({ id: input.id });

        if ( !template ) {
            console.log(`ocr template not found: ${input.id}`);
            return;
        }

        const changedRegions = input.target_regions.filter( item => {

            const regionExists = template.getTargetRegion( item.id );

            return Boolean( regionExists );
        });

        const newRegions = input.target_regions.filter( item => {

            const regionExists = template.getTargetRegion( item.id );

            return !Boolean( regionExists );
        });

        const removedRegions = template.target_regions.filter( region => {

            const regionExists = input.target_regions.some( r => r.id === region.id  );

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

        template.name = input.name;
        template.image = input.image;
        template.capture_source_name = input.capture_source_name;
        template.capturer_options = input.capturer_options;

        await this.ocrTemplateRepo.update( template );

        const updatedTemplate = await this.ocrTemplateRepo.findOne({ id: template.id });

        if ( !updatedTemplate )
            throw new Error('ocr-template-not-found');

        return updatedTemplate;
    }
}