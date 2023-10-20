import { Repository } from "typeorm";
import { DictionaryTagFindOneInput, DictionaryTagRepository } from "../../../../../domain/dictionary/dictionary_tag/dictionary_tag.repository";
import { DictionaryTag } from "../../../../../domain/dictionary/dictionary_tag/dictionary_tag";



export default class DictionaryTagTypeOrmRepository implements DictionaryTagRepository {

    constructor ( private ormRepo: Repository< DictionaryTag > ) {}

    async insert( tags: DictionaryTag[] ): Promise< void > {
        await this.ormRepo.save( tags );
    }
    
    async findOne( params: DictionaryTagFindOneInput ): Promise< DictionaryTag | null > {
        return this.ormRepo.findOneBy( params );
    }

    async getAll(): Promise< DictionaryTag[] > {
        return this.ormRepo.find();
    }

    async delete( id: string ): Promise< void> {
        await this.ormRepo.delete( { id } );
    }
}