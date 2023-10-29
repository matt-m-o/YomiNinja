import { JapaneseHelperAdapter } from "../@core/application/adapters/japanese_helper.adapter";
import { ExtractTermsFromTextUseCase } from "../@core/application/use_cases/dictionary/extract_terms_from_text/extract_terms_from_text.use_case";
import { SearchDictionaryTermUseCase, SearchDictionaryTerm_Input } from "../@core/application/use_cases/dictionary/search_dictionary_term/search_dictionary_term.use_case";
import { GetProfileUseCase } from "../@core/application/use_cases/get_profile/get_profile.use_case";
import { DictionaryHeadword, DictionaryHeadwordId } from "../@core/domain/dictionary/dictionary_headword/dictionary_headword";
import { Language } from "../@core/domain/language/language";
import { getActiveProfile } from "../@core/infra/app_initialization";


export class DictionariesService {

    private searchDictionaryTermUseCase: SearchDictionaryTermUseCase;
    private extractTermsFromTextUseCase: ExtractTermsFromTextUseCase;
    private getProfileUseCase: GetProfileUseCase;
    private japaneseHelper: JapaneseHelperAdapter;

    constructor(
        input: {
            searchDictionaryTermUseCase: SearchDictionaryTermUseCase;
            extractTermsFromTextUseCase: ExtractTermsFromTextUseCase;
            getProfileUseCase: GetProfileUseCase;
            japaneseHelper: JapaneseHelperAdapter;
        }
    ){        
        this.searchDictionaryTermUseCase = input.searchDictionaryTermUseCase;
        this.extractTermsFromTextUseCase = input.extractTermsFromTextUseCase;
        this.japaneseHelper = input.japaneseHelper;
    }

    async searchHeadwords( text: string ): Promise< DictionaryHeadword[] > {

        // const profile = await this.getProfileUseCase.execute({
        //     profileId: getActiveProfile().id
        // });

        // if ( !profile ) return [];

        const langJapanese = Language.create({ name: 'Japanese', two_letter_code: 'ja' });
        
        const { standard, kanaNormalized } = await this.extractTermsFromTextUseCase.execute({
            text,
            language: langJapanese, // profile.active_ocr_language,
        });        

        const standardSearchString = standard.join('');
        const kanaNormalizedSearchString = kanaNormalized?.join('');

        const headwordsMap = new Map< DictionaryHeadwordId, DictionaryHeadword >();        
        
        const originalTextResults = await this.searchDictionaryTermUseCase.execute({
            term: text,
            reading: text
        });

        const standardResults = await this.searchDictionaryTermUseCase.execute({
            term: standardSearchString,
            reading: standardSearchString
        });
        
        let kanaNormalizedSearchResult: DictionaryHeadword[] = [];

        if ( kanaNormalizedSearchString ) {
            
            kanaNormalizedSearchResult = await this.searchDictionaryTermUseCase.execute({
                term: kanaNormalizedSearchString,
                reading: kanaNormalizedSearchString
            });
        }

        const results = [
            ...originalTextResults,
            ...standardResults,
            ...kanaNormalizedSearchResult
        ];

        results.sort( ( a, b ) => a.term.length - b.term.length )
            .sort( ( a, b ) => b.getPopularityScore() - a.getPopularityScore() )
            .forEach(
                headword => headwordsMap.set( headword.id, headword )
            );

        return Array.from( headwordsMap.values() );
    }

    
}