import { DictionaryId } from "../dictionary";
import { DictionaryHeadwordId } from "../dictionary_headword/dictionary_headword";
import { DictionaryHeadword } from "./dictionary_headword";


export type DictionaryHeadwordFindOneInput = {
    id: DictionaryHeadwordId;
} | {
    term: string;
    reading: string;
}

export type DictionaryHeadwordFindManyInput = {    
    term?: string;
    reading?: string;
}

export interface DictionaryHeadwordRepository {

    insert( headwords: DictionaryHeadword[] ): Promise< void >;

    update( headwords: DictionaryHeadword[] ): Promise< void >;

    exist( params: DictionaryHeadwordFindOneInput ): Promise< boolean >;
    
    findOne( input: DictionaryHeadwordFindOneInput ): Promise< DictionaryHeadword | null >;

    findMany( input: DictionaryHeadwordFindManyInput ): Promise< DictionaryHeadword[] | null >;

    findManyLike( input: DictionaryHeadwordFindManyInput ): Promise< DictionaryHeadword[] >;

    delete( id: DictionaryHeadwordId ): Promise< void >;
}