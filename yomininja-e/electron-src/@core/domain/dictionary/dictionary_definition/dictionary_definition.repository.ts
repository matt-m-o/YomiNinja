import { DictionaryId } from "../dictionary";
import { DictionaryHeadwordId } from "../dictionary_headword/dictionary_headword";
import { DictionaryDefinition, DictionaryDefinitionId } from "./dictionary_definition";


export type DictionaryDefinitionFindOneInput = {
    id: DictionaryDefinitionId;    
}

export type DictionaryDefinitionFindManyInput = {    
    dictionary_headword_id: DictionaryHeadwordId;
    dictionary_id?: DictionaryId;
}

export interface DictionaryDefinitionRepository {

    insert( definitions: DictionaryDefinition[] ): Promise< void >;
    
    findOne( input: DictionaryDefinitionFindOneInput ): Promise< DictionaryDefinition | null >;

    findMany( input: DictionaryDefinitionFindManyInput ): Promise< DictionaryDefinition[] | null >;

    delete( id: DictionaryDefinitionId ): Promise< void >;

    deleteByDictionaryId( id: DictionaryId ): Promise< void >;
}