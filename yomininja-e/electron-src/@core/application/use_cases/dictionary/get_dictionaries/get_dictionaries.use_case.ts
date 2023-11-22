import { Dictionary } from "../../../../domain/dictionary/dictionary";
import { DictionaryRepository } from "../../../../domain/dictionary/dictionary.repository";



export class GetDictionariesUseCase {

    dictionariesRepo: DictionaryRepository;        

    constructor( input: {
        dictionariesRepo: DictionaryRepository,
    } ) {
        this.dictionariesRepo = input.dictionariesRepo;
    }

    async execute(): Promise< Dictionary[] > {        
        
        const dictionaries = await this.dictionariesRepo.getAll();

        return dictionaries;
    }
}

