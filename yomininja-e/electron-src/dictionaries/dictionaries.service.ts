import { ExtractTermsFromTextUseCase } from "../@core/application/use_cases/dictionary/extract_terms_from_text/extract_terms_from_text.use_case";
import { SearchDictionaryTermUseCase } from "../@core/application/use_cases/dictionary/search_dictionary_term/search_dictionary_term.use_case";
import { GetProfileUseCase } from "../@core/application/use_cases/get_profile/get_profile.use_case";
import { DictionaryHeadword } from "../@core/domain/dictionary/dictionary_headword/dictionary_headword";
import { Language } from "../@core/domain/language/language";
import { getActiveProfile } from "../@core/infra/app_initialization";


export class DictionariesService {

    private searchDictionaryTermUseCase: SearchDictionaryTermUseCase;
    private extractTermsFromTextUseCase: ExtractTermsFromTextUseCase;
    private getProfileUseCase: GetProfileUseCase;

    constructor(
        input: {
            searchDictionaryTermUseCase: SearchDictionaryTermUseCase;
            extractTermsFromTextUseCase: ExtractTermsFromTextUseCase;
            getProfileUseCase: GetProfileUseCase
        }
    ){        
        this.searchDictionaryTermUseCase = input.searchDictionaryTermUseCase;
        this.extractTermsFromTextUseCase = input.extractTermsFromTextUseCase;
    }

    async searchHeadwords( text: string ): Promise< DictionaryHeadword[] > {

        // const profile = await this.getProfileUseCase.execute({
        //     profileId: getActiveProfile().id
        // });

        // if ( !profile ) return [];

        const langJapanese = Language.create({ name: 'Japanese', two_letter_code: 'ja' });

        const terms = await this.extractTermsFromTextUseCase.execute({
            text,
            language: langJapanese, // profile.active_ocr_language,
        });

        const headwords = await this.searchDictionaryTermUseCase.execute({
            term: terms[0]
        });

        console.log(headwords);

        return headwords;
    }
}