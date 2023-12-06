import { OcrTargetRegion, OcrTargetRegionCreationInput } from "../../../domain/ocr_template/ocr_target_region/ocr_target_region";
import { OcrTargetRegionRepository } from "../../../domain/ocr_template/ocr_target_region/ocr_target_region.repository";
import { OcrTemplate, OcrTemplateCreationInput } from "../../../domain/ocr_template/ocr_template";
import { OcrTemplateRepository } from "../../../domain/ocr_template/ocr_template.repository";


export interface CreateOcrTemplate_Input extends Omit< 
    OcrTemplateCreationInput,
    'target_regions'
> {
    targetRegions?: Omit< OcrTargetRegionCreationInput, 'ocr_template_id' >[]
};

export class CreateOcrTemplateUseCase {

    public ocrTemplateRepo: OcrTemplateRepository;
    public ocrTargetRegionRepo: OcrTargetRegionRepository;

    constructor( input: {
        ocrTemplateRepo: OcrTemplateRepository,
        ocrTargetRegionRepo: OcrTargetRegionRepository,
    }) {
        this.ocrTemplateRepo = input.ocrTemplateRepo;
        this.ocrTargetRegionRepo = input.ocrTargetRegionRepo;
    }

    async execute( input: CreateOcrTemplate_Input ): Promise< OcrTemplate > {

        const foundOcrTemplate = await this.ocrTemplateRepo.findOne({ name: input.name });
        if ( foundOcrTemplate )
            throw new Error('ocr-template-already-exists');

        const ocrTemplate = OcrTemplate.create({
            name: input.name,
            image: input.image,
        });

        await this.ocrTemplateRepo.insert( ocrTemplate );
        
        if ( input?.targetRegions ) {

            for ( const data of input?.targetRegions ) {

                const region = OcrTargetRegion.create({
                    ...data,
                    ocr_template_id: ocrTemplate.id
                });

                await this.ocrTargetRegionRepo.insert( region );

                ocrTemplate.addTargetRegion( region );
            }
        }

        return ocrTemplate;
    }
}