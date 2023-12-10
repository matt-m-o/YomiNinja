import { FindOptionsWhere, Like, Repository, UnorderedBulkOperation } from "typeorm";
import { OcrTemplate, OcrTemplateId } from "../../../../domain/ocr_template/ocr_template";
import { OcrTemplateFindManyInput, OcrTemplateFindOneInput, OcrTemplateRepository } from "../../../../domain/ocr_template/ocr_template.repository";



export default class OcrTemplateTypeOrmRepository implements OcrTemplateRepository {

    constructor ( private ormRepo: Repository< OcrTemplate > ) {}

    async insert( template: OcrTemplate ): Promise<void> {
        await this.ormRepo.save( template );
    }

    async update( template: OcrTemplate ): Promise<void> {
        await this.ormRepo.save( template );
    }

    async findOne( params: OcrTemplateFindOneInput ): Promise< OcrTemplate | null > {

        const template = await this.ormRepo.findOne({
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

        const template = await this.ormRepo.find({
            where,
            relations: [ 'target_regions' ]
        });

        this.runNullCheck( template );

        return template;
    }
    
    async getAll(): Promise< OcrTemplate[] > {

        const items = await this.ormRepo.find({
            relations: [ 'target_regions' ]
        });

        this.runNullCheck( items );

        return items;
    }

    async delete( id: OcrTemplateId ): Promise<void> {
        await this.ormRepo.delete( { id } );
    }

    private runNullCheck( input?: OcrTemplate | OcrTemplate[] | null ) {

        if ( !input ) return;

        if ( Array.isArray(input) )
            input.forEach( item => item.nullCheck() );
        else 
            input.nullCheck();
    }
}