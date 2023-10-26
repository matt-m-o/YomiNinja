import { DictionaryHeadword, DictionaryHeadwordId } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword";
import { DictionaryHeadwordRepository } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository";
import { FuriganaDictionaryItem } from "./furigana_dictionary_types";


export interface ImportFuriganaDictionary_Input {
    items: FuriganaDictionaryItem[];
}

export class ImportFuriganaDictionaryUseCase {
    
    headwordsRepo: DictionaryHeadwordRepository;    

    constructor( input: {
        headwordsRepo: DictionaryHeadwordRepository,
    } ) {
        this.headwordsRepo = input.headwordsRepo;
    }

    async execute( input: ImportFuriganaDictionary_Input ): Promise< void > {

        const { items } = input;

        const headwords: DictionaryHeadword[] = [];
        
        for ( const item of items ) {

            if ( !item?.text || !item?.reading )
                continue;

            const headwordId = DictionaryHeadword.generateId({
                term: item.text,
                reading: item.reading,
            });

            let headword = await this.headwordsRepo.findOne({ id: headwordId });

            if ( !headword ) {
                headword = DictionaryHeadword.create({
                    term: item.text,
                    reading: item.reading,
                });
            }

            headword.addFurigana( item.furigana );

            headwords.push(headword);
        }        
            
            
        await this.headwordsRepo.update( headwords )
            .catch( console.error );
            
    }
}

