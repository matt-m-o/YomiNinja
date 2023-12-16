import { FindOptionsWhere, Like, Repository, UnorderedBulkOperation } from "typeorm";
import { OcrTemplate, OcrTemplateId } from "../../../../domain/ocr_template/ocr_template";
import { OcrTemplateFindManyInput, OcrTemplateFindOneInput, OcrTemplateRepository } from "../../../../domain/ocr_template/ocr_template.repository";
import { OcrTargetRegion } from "../../../../domain/ocr_template/ocr_target_region/ocr_target_region";



export default class OcrTemplateTypeOrmRepository implements OcrTemplateRepository {

    constructor (
        private ocrTemplatesOrmRepo: Repository< OcrTemplate >,
        private ocrTargetRegionsOrmRepo: Repository< OcrTargetRegion >,
    ) {}

    async insert( template: OcrTemplate ): Promise< OcrTemplate > {
        return await this.ocrTemplatesOrmRepo.save( template );
    }

    async update( template: OcrTemplate ): Promise<void> {
        await this.ocrTemplatesOrmRepo.save( template );
    }

    async findOne( params: OcrTemplateFindOneInput ): Promise< OcrTemplate | null > {

        const template = await this.ocrTemplatesOrmRepo.findOne({
            where: {
                ...params,
            },
            relations: [ 'target_regions' ]
        });

        this.runNullCheck( template );

        return template;
    }

    async findMany( params: OcrTemplateFindManyInput ): Promise< OcrTemplate[] > {

        const where: FindOptionsWhere< OcrTemplate > = {};

        if ( params.name )
            where.name = Like(`%${params.name}%`);

        if ( params.capture_source_name )
            where.capture_source_name = Like(`%${params.capture_source_name}%`);

        const template = await this.ocrTemplatesOrmRepo.find({
            where,
            relations: [ 'target_regions' ]
        });

        this.runNullCheck( template );

        return template;
    }
    
    async getAll(): Promise< OcrTemplate[] > {

        const items = await this.ocrTemplatesOrmRepo.find({
            relations: [ 'target_regions' ]
        });

        this.runNullCheck( items );

        return items;
    }

    async delete( id: OcrTemplateId ): Promise<void> {

        const ocrTemplate = await this.ocrTemplatesOrmRepo.findOne({
            where: {
                id,
            }
        });

        if ( !ocrTemplate ) return;

        for( const region of ocrTemplate?.target_regions ) {
            await this.ocrTargetRegionsOrmRepo.delete({
                id: region.id
            });
        }
        
        await this.ocrTemplatesOrmRepo.delete({ id });
    }

    private runNullCheck( input?: OcrTemplate | OcrTemplate[] | null ) {

        if ( !input ) return;

        if ( Array.isArray(input) )
            input.forEach( item => item.nullCheck() );
        else 
            input.nullCheck();
    }
}