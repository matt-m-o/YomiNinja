import { JapaneseHelperAdapter } from "../@core/application/adapters/japanese_helper.adapter";
import { DeleteAllDictionariesUseCase } from "../@core/application/use_cases/dictionary/delete_all_dictionaries/delete_all_dictionaries.use_case";
import { ExtractTermsFromTextUseCase } from "../@core/application/use_cases/dictionary/extract_terms_from_text/extract_terms_from_text.use_case";
import { GetDictionariesUseCase } from "../@core/application/use_cases/dictionary/get_dictionaries/get_dictionaries.use_case";
import { SearchDictionaryTermUseCase, SearchDictionaryTerm_Input } from "../@core/application/use_cases/dictionary/search_dictionary_term/search_dictionary_term.use_case";
import { GetProfileUseCase } from "../@core/application/use_cases/get_profile/get_profile.use_case";
import { Dictionary } from "../@core/domain/dictionary/dictionary";
import { DictionaryHeadword, DictionaryHeadwordId } from "../@core/domain/dictionary/dictionary_headword/dictionary_headword";
import { Language } from "../@core/domain/language/language";
import { getActiveProfile } from "../@core/infra/app_initialization";


export class DictionariesService {

    private searchDictionaryTermUseCase: SearchDictionaryTermUseCase;
    private extractTermsFromTextUseCase: ExtractTermsFromTextUseCase;
    private getProfileUseCase: GetProfileUseCase;
    private getDictionariesUseCase: GetDictionariesUseCase;
    private deleteAllDictionariesUseCase: DeleteAllDictionariesUseCase;
    private japaneseHelper: JapaneseHelperAdapter;

    constructor(
        input: {
            searchDictionaryTermUseCase: SearchDictionaryTermUseCase;
            extractTermsFromTextUseCase: ExtractTermsFromTextUseCase;
            getProfileUseCase: GetProfileUseCase;
            getDictionariesUseCase: GetDictionariesUseCase;
            deleteAllDictionariesUseCase: DeleteAllDictionariesUseCase;
            japaneseHelper: JapaneseHelperAdapter;
        }
    ){        
        this.searchDictionaryTermUseCase = input.searchDictionaryTermUseCase;
        this.extractTermsFromTextUseCase = input.extractTermsFromTextUseCase;
        this.getDictionariesUseCase = input.getDictionariesUseCase;
        this.deleteAllDictionariesUseCase = input.deleteAllDictionariesUseCase;
        this.japaneseHelper = input.japaneseHelper;
        this.getProfileUseCase = input.getProfileUseCase;
    }

    async searchHeadwords( text: string ): Promise< DictionaryHeadword[] > {

        let results: DictionaryHeadword[] = [];

        const profile = await this.getProfileUseCase.execute({
            profileId: getActiveProfile().id
        });

        if (!profile) return results;

        const { active_ocr_language } = profile

        if ( !active_ocr_language ) 
            return results;        
        

        text = text.slice(0, 30);

        if ( profile.active_ocr_language.two_letter_code === 'ja' ) {
            
            results = await this.searchJapaneseHeadwords({
                text,
                targetLanguage: active_ocr_language
            });
        }

        return results;
    }

    private async searchJapaneseHeadwords( input: { text: string, targetLanguage: Language } ) {

        const { text, targetLanguage } = input;

        const { standard, kanaNormalized } = await this.extractTermsFromTextUseCase.execute({
            text,
            language: targetLanguage,
        });

        const firstTermHasKanji = (
            this.japaneseHelper.hasKanji( standard[0] ) ||
            this.japaneseHelper.hasKanji( kanaNormalized?.[0] || '' )
        );

        const standardSearchString = standard.join('');
        const kanaNormalizedSearchString = kanaNormalized?.join('');

        const headwordsMap = new Map< DictionaryHeadwordId, DictionaryHeadword >();
        
        const originalTextResults = await this.searchDictionaryTermUseCase.execute({
            term: text,
            reading: firstTermHasKanji ? undefined : text
        });

        const standardResults = await this.searchDictionaryTermUseCase.execute({
            term: standardSearchString,
            reading: firstTermHasKanji ? undefined : standardSearchString
        });
        
        let kanaNormalizedSearchResult: DictionaryHeadword[] = [];

        if ( kanaNormalizedSearchString ) {
            
            kanaNormalizedSearchResult = await this.searchDictionaryTermUseCase.execute({
                term: kanaNormalizedSearchString,
                reading: firstTermHasKanji ? undefined : kanaNormalizedSearchString
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


    async getInstalledDictionaries(): Promise< Dictionary[] > {
        return await this.getDictionariesUseCase.execute();
    }

    async deleteAllDictionaries(): Promise< void > {
        await this.deleteAllDictionariesUseCase.execute();
    }
}