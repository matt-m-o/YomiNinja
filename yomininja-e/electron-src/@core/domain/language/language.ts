import { randomUUID } from "crypto";


export interface LanguageProps {
    name: string; // English name
    two_letter_code: string; // ISO 639-1
    three_letter_code?: string; // ISO 639-2
    bcp47_tag?: string; // IETF BCP 47 language tag
};


export interface Language_CreationInput extends Partial< LanguageProps > {
    name: string;
    two_letter_code: string;
};


export class Language {    

    public id: string; // ID
    private props: LanguageProps;
    
    
    private constructor( input: Language_CreationInput, id?: string ) {

        this.id = id || randomUUID();
        
        this.props = {
            ...input,
            three_letter_code: input?.three_letter_code || undefined,
            bcp47_tag: input?.bcp47_tag || undefined,
        };        
    }

    static create( input: Language_CreationInput ): Language {
        return new Language( input );
    }
    
    get name(){ return this.props.name; }
    get two_letter_code(){ return this.props.two_letter_code; }
    get three_letter_code(): string | undefined {
        return this.props.three_letter_code;
    }
    get bcp47_tag(): string | undefined {
        return this.props.bcp47_tag;
    }


    set name( value: string ){ this.props.name = value; }

    set two_letter_code( value: string ) {

        if ( value.length != 2 )
            return;

        this.props.two_letter_code = value;
    }

    
    set three_letter_code( value: string | undefined ) {
        
        if ( !value )
            value = undefined;

        if ( value?.length != 3 )
            return;

        this.props.three_letter_code = value;
    }

    set bcp47_tag( value: string | undefined ) {
        this.props.bcp47_tag = value;
    }

    toJson(): LanguageJson {
        return {
            id: this.id,
            ...this.props,
        }
    }
}

export interface LanguageJson extends LanguageProps {
    id: string;
}