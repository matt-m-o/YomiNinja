import { Language } from "./language";


export type LanguageFindOneInput = {
    id?: string;
    name?: string;
    two_letter_code?: string;
    three_letter_code?: string;
    bcp47_tag?: string;
}

export interface LanguageRepository {

    insert( language: Language ): Promise< void >;    

    findOne( input: LanguageFindOneInput ): Promise< Language | null >;

    update( input: Language ): Promise< void >;

    getAll(): Promise< Language[] >;    

    delete:( id: string ) => Promise< void >;
}