import { Repository } from "typeorm";
import { DictionaryDefinitionFindManyInput, DictionaryDefinitionFindOneInput, DictionaryDefinitionRepository } from "../../../../../domain/dictionary/dictionary_definition/dictionary_definition.repository";
import { DictionaryDefinition, DictionaryDefinitionId } from "../../../../../domain/dictionary/dictionary_definition/dictionary_definition";



export default class DictionaryDefinitionTypeOrmRepository implements DictionaryDefinitionRepository {

    constructor ( private ormRepo: Repository< DictionaryDefinition > ) {}

    async insert( definitions: DictionaryDefinition[] ): Promise< void > {

        const batchSize = 1000;

        for (let i = 0; i < definitions.length; i += batchSize) {

            const batch = definitions.slice(i, i + batchSize);
            await this.ormRepo.save( batch );
        }
    }
    
    async findOne( params: DictionaryDefinitionFindOneInput ): Promise< DictionaryDefinition | null > {
        return this.ormRepo.findOneBy( params );
    }

    async findMany( params: DictionaryDefinitionFindManyInput ): Promise< DictionaryDefinition[] | null > {
        return this.ormRepo.findBy( params );
    }

    async delete( id: DictionaryDefinitionId ): Promise< void> {
        await this.ormRepo.delete( { id } );
    }
}