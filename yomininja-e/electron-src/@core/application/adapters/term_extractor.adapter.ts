import { Language } from "../../domain/language/language";

export type GetTermsInput = {    
    text: string;
    language?: Language;
};

export interface TermExtractorAdapter {
    getTerms: ( input: GetTermsInput ) => string[];
    getTermsAsync: ( input: GetTermsInput ) => Promise< string[] >;
}