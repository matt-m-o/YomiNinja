import { FindManyOptions, Repository } from "typeorm";
import { DictionaryTagFindOneInput, DictionaryTagRepository } from "../../../../../domain/dictionary/dictionary_tag/dictionary_tag.repository";
import { DictionaryTag, DictionaryTagId } from "../../../../../domain/dictionary/dictionary_tag/dictionary_tag";
import { DictionaryId } from "../../../../../domain/dictionary/dictionary";



export default class DictionaryTagTypeOrmRepository implements DictionaryTagRepository {

    constructor ( private ormRepo: Repository< DictionaryTag > ) {}

    async insert( tags: DictionaryTag[] ): Promise< void > {
        await this.ormRepo.save( tags );
    }
    
    async findOne( params: DictionaryTagFindOneInput ): Promise< DictionaryTag | null > {
        return this.ormRepo.findOneBy( params );
    }

    async getAll( dictionaryId?: DictionaryId ): Promise< DictionaryTag[] > {
        
        const options: FindManyOptions<DictionaryTag> = {};

        if ( dictionaryId )
            options.where = { dictionary_id: dictionaryId };
        
        return this.ormRepo.find(options);
    }

    async delete( id: DictionaryTagId ): Promise< void> {
        await this.ormRepo.delete( { id } );
    }
}