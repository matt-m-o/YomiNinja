import { Dictionary } from "./dictionary";


export type DictionaryFindOneInput = {
    id?: string;
    name?: string;
}

export interface DictionaryRepository {

    insert( dictionary: Dictionary ): Promise< void >;
    
    findOne( input: DictionaryFindOneInput ): Promise< Dictionary | null >;

    getAll(): Promise< Dictionary[] >;

    delete( id: string ): Promise< void >;
}