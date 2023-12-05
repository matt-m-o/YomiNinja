import { Repository } from "typeorm";
import { OcrTemplate } from "../../../../domain/ocr_template/ocr_template";
import { OcrTemplateFindOneInput, OcrTemplateRepository } from "../../../../domain/ocr_template/ocr_template.repository";



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
    
    async getAll(): Promise< OcrTemplate[] > {

        const items = await this.ormRepo.find();

        this.runNullCheck( items );

        return items;
    }

    async delete(id: string): Promise<void> {
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