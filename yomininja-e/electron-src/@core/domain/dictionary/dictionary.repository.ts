import { Dictionary } from "./dictionary";


export type DictionaryFindOneInput = {
    id?: string;
    name?: string;
}

export type DictionaryFindManyInput = {        
    source_language?: string;
    target_language?: string;
}

export interface DictionaryRepository {

    insert( dictionary: Dictionary ): Promise< void >;
    
    findOne( input: DictionaryFindOneInput ): Promise< Dictionary | null >;

    findMany( input: DictionaryFindManyInput ): Promise< Dictionary[] >;

    getAll(): Promise< Dictionary[] >;

    delete( id: string ): Promise< void >;
}