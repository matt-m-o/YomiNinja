import { Repository } from "typeorm";
import { DictionaryHeadwordFindManyInput, DictionaryHeadwordFindOneInput, DictionaryHeadwordRepository } from "../../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository";
import { DictionaryHeadword } from "../../../../../domain/dictionary/dictionary_headword/dictionary_headword";



export default class DictionaryHeadwordTypeOrmRepository implements DictionaryHeadwordRepository {

    constructor ( private ormRepo: Repository< DictionaryHeadword > ) {}

    async insert( definitions: DictionaryHeadword[] ): Promise< void > {
        await this.ormRepo.save( definitions );
    }

    async exist( params: DictionaryHeadwordFindOneInput ): Promise< boolean > {        

        return await this.ormRepo.exist({
            where: params
        });
    }
    
    async findOne( params: DictionaryHeadwordFindOneInput ): Promise< DictionaryHeadword | null > {

        return this.ormRepo.findOne({
            where: {
                ...params,
            },
            relations: [ 'tags', 'definitions' ]
        });
    }

    async findMany( params: DictionaryHeadwordFindManyInput ): Promise< DictionaryHeadword[] | null > {
        return this.ormRepo.find({
            where: params,
            relations: [ 'tags', 'definitions' ]
        });
    }

    async delete( id: string ): Promise< void> {
        await this.ormRepo.delete( { id } );
    }
}