import { Dictionary } from "../../../../domain/dictionary/dictionary";
import { DictionaryRepository } from "../../../../domain/dictionary/dictionary.repository";
import { DictionaryDefinitionRepository } from "../../../../domain/dictionary/dictionary_definition/dictionary_definition.repository";
import { DictionaryHeadwordRepository } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository";
import { DictionaryTagRepository } from "../../../../domain/dictionary/dictionary_tag/dictionary_tag.repository";


// 
export class DeleteAllDictionariesUseCase {

    dictionariesRepo: DictionaryRepository;
    definitionsRepo: DictionaryDefinitionRepository;
    headwordsRepo: DictionaryHeadwordRepository;
    tagsRepo: DictionaryTagRepository;

    constructor( input: {
        dictionariesRepo: DictionaryRepository,
        definitionsRepo: DictionaryDefinitionRepository,
        headwordsRepo: DictionaryHeadwordRepository,
        tagsRepo: DictionaryTagRepository,
    } ) {
        this.dictionariesRepo = input.dictionariesRepo;
        this.definitionsRepo = input.definitionsRepo;
        this.headwordsRepo = input.headwordsRepo;
        this.tagsRepo = input.tagsRepo;
    }

    async execute(): Promise< void > {
        
        const dictionaries = await this.dictionariesRepo.getAll();

        for ( const dictionary of dictionaries ) {
            
            await this.definitionsRepo.deleteByDictionaryId( dictionary.id );
            await this.headwordsRepo.deleteAll();
            await this.tagsRepo.deleteByDictionaryId( dictionary.id );
    
            await this.dictionariesRepo.delete( dictionary.id );
        }
    }
}


