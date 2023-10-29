import { Language } from "../../../../domain/language/language";
import { ExtractedTerms, TermExtractorAdapter } from "../../../adapters/term_extractor.adapter";


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

    async execute( input: ExtractTermsFromText_Input ): Promise< ExtractedTerms > {

        const { text, language } = input;

        const extractedTerms = await this.termExtractor.getTerms({
            text,
            language
        });

        return extractedTerms;
    }
}

