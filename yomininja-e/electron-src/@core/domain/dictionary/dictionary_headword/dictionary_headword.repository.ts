import { DictionaryId } from "../dictionary";
import { DictionaryHeadwordId } from "../dictionary_headword/dictionary_headword";
import { DictionaryHeadword } from "./dictionary_headword";


export type DictionaryHeadwordFindOneInput = {
    id: string;
} | {
    term: string;
    reading: string;
}

export type DictionaryHeadwordFindManyInput = {    
    term?: DictionaryHeadwordId;
    reading?: DictionaryId;
}

export interface DictionaryHeadwordRepository {

    insert( definitions: DictionaryHeadword[] ): Promise< void >;

    exist( params: DictionaryHeadwordFindOneInput ): Promise< boolean >;
    
    findOne( input: DictionaryHeadwordFindOneInput ): Promise< DictionaryHeadword | null >;

    findMany( input: DictionaryHeadwordFindManyInput ): Promise< DictionaryHeadword[] | null >;

    findManyLike( input: DictionaryHeadwordFindManyInput ): Promise< DictionaryHeadword[] >;

    delete( id: string ): Promise< void >;
}