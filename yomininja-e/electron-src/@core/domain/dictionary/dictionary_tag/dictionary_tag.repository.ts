import { DictionaryId } from "../dictionary";
import { DictionaryTag } from "./dictionary_tag";

export type DictionaryTagFindOneInput = {
    id?: string;
    name?: string;
}

export interface DictionaryTagRepository {

    insert( dictionaryTags: DictionaryTag[] ): Promise< void >;
    
    findOne( input: DictionaryTagFindOneInput ): Promise< DictionaryTag | null >;

    getAll( dictionaryId?: DictionaryId ): Promise< DictionaryTag[] >;

    delete( id: string ): Promise< void >;
}