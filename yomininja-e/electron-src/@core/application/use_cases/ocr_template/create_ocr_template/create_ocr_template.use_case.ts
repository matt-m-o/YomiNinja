import { OcrTargetRegion, OcrTargetRegionCreationInput, OcrTargetRegionJson } from "../../../../domain/ocr_template/ocr_target_region/ocr_target_region";
import { OcrTargetRegionRepository } from "../../../../domain/ocr_template/ocr_target_region/ocr_target_region.repository";
import { OcrTemplate, OcrTemplateCreationInput, OcrTemplateJson } from "../../../../domain/ocr_template/ocr_template";
import { OcrTemplateRepository } from "../../../../domain/ocr_template/ocr_template.repository";


export interface CreateOcrTemplate_Input extends Omit<
    OcrTemplateJson,
    'id' |
    'created_at' |
    'updated_at' |
    'target_regions' |
    'capture_source_name' |
    'capturer_options' |
    'image_base64'
> {
    target_regions?: OcrTargetRegionJson[],
    capture_source_name?: string | null,
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

        let ocrTemplate = OcrTemplate.create({
            ...input,
            target_regions: []
        });

        ocrTemplate = await this.ocrTemplateRepo.insert( ocrTemplate );
        
        if ( input?.target_regions ) {

            for ( const data of input.target_regions ) {

                const region = OcrTargetRegion.create({
                    ...data,
                    ocr_template_id: ocrTemplate.id
                });

                await this.ocrTargetRegionRepo.insert( region );

                ocrTemplate.addTargetRegion( region );
            }
        }

        // For some reason this is required to get the correct base64 encoded image
        ocrTemplate = await this.ocrTemplateRepo.findOne({
            id: ocrTemplate.id
        }) || ocrTemplate;

        return ocrTemplate;
    }
}