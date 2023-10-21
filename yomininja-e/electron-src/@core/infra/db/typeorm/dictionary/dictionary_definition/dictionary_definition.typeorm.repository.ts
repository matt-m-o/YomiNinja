import { Repository } from "typeorm";
import { DictionaryDefinitionFindManyInput, DictionaryDefinitionFindOneInput, DictionaryDefinitionRepository } from "../../../../../domain/dictionary/dictionary_definition/dictionary_definition.repository";
import { DictionaryDefinition } from "../../../../../domain/dictionary/dictionary_definition/dictionary_definition";



export default class DictionaryDefinitionTypeOrmRepository implements DictionaryDefinitionRepository {

    constructor ( private ormRepo: Repository< DictionaryDefinition > ) {}

    async insert( definitions: DictionaryDefinition[] ): Promise< void > {
        await this.ormRepo.save( definitions );
    }
    
    async findOne( params: DictionaryDefinitionFindOneInput ): Promise< DictionaryDefinition | null > {
        return this.ormRepo.findOneBy( params );
    }

    async findMany( params: DictionaryDefinitionFindManyInput ): Promise< DictionaryDefinition[] | null > {
        return this.ormRepo.findBy( params );
    }

    async delete( id: string ): Promise< void> {
        await this.ormRepo.delete( { id } );
    }
}