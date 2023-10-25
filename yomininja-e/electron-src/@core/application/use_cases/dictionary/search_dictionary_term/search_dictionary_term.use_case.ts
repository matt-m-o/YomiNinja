import { DictionaryRepository } from "../../../../domain/dictionary/dictionary.repository";
import { DictionaryHeadword } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword";
import { DictionaryHeadwordRepository } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository";


export interface SearchDictionaryTerm_Input {
    term: string;
}

export class SearchDictionaryTermUseCase {

    dictionariesRepo: DictionaryRepository;    
    headwordsRepo: DictionaryHeadwordRepository;    

    constructor( input: {
        dictionariesRepo: DictionaryRepository,        
        headwordsRepo: DictionaryHeadwordRepository,
    } ) {
        this.dictionariesRepo = input.dictionariesRepo;        
        this.headwordsRepo = input.headwordsRepo;
    }

    async execute( input: SearchDictionaryTerm_Input ): Promise< DictionaryHeadword[] > {

        const { term } = input;

        const headwords = await this.headwordsRepo.findManyLike({
            term,
        });

        return headwords || [];
    }
}

