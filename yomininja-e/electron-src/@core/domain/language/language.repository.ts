import { Language } from "./language";


export type LanguageFindOneInput = {
    id?: string;
    name?: string;
    two_letter_code?: string;
    three_letter_code?: string;
}

export interface LanguageRepository {

    insert( language: Language ): Promise< void >;    

    findOne( input: LanguageFindOneInput ): Promise< Language | null >;

    getAll(): Promise< Language[] >;    
}