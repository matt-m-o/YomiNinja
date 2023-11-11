import { Language } from "../../domain/language/language";

export type GetTermsInput = {    
    text: string;
    language?: Language;
};

export type ExtractedTerms = {
    standard: string[];
    kanaNormalized?: string[];
    readingNormalized?: string[];
};

export interface TermExtractorAdapter {
    getTerms: ( input: GetTermsInput ) => ExtractedTerms;
    getTermsAsync: ( input: GetTermsInput ) => Promise< ExtractedTerms >;
}