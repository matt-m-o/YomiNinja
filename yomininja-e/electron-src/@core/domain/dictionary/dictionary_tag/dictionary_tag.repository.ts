import { DictionaryId } from "../dictionary";
import { DictionaryTag, DictionaryTagId } from "./dictionary_tag";

export type DictionaryTagFindOneInput = {
    id?: DictionaryTagId;
    name?: string;
}

export interface DictionaryTagRepository {

    insert( dictionaryTags: DictionaryTag[] ): Promise< void >;
    
    findOne( input: DictionaryTagFindOneInput ): Promise< DictionaryTag | null >;

    getAll( dictionaryId?: DictionaryId ): Promise< DictionaryTag[] >;

    delete( id: DictionaryTagId ): Promise< void >;
}