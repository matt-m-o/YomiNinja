import { Language } from "../../../../domain/language/language";
import { TermExtractorAdapter } from "../../../adapters/term_extractor.adapter";


export interface ExtractTermsFromText_Input {
    text: string;
    language: Language;
}

export class ExtractTermsFromTextUseCase {

    termExtractor: TermExtractorAdapter;    

    constructor( input: {
        termExtractor: TermExtractorAdapter,                
    } ) {
        this.termExtractor = input.termExtractor;
    }

    async execute( input: ExtractTermsFromText_Input ): Promise< string[] > {

        const { text, language } = input;

        const terms = await this.termExtractor.getTerms({
            text,
            language
        });

        return terms;
    }
}

