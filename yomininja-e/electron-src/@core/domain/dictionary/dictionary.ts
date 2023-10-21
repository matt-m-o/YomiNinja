import crypto from 'crypto';

export type DictionaryId = string;

export type DictionaryConstructorProps = {
    id?: DictionaryId;
    name: string;
    order: number;
    enabled: boolean;
    source_language: string;
    target_language: string;    
}

export interface DictionaryCreationInput extends Omit<
    DictionaryConstructorProps,
    'id'
> {};

export class Dictionary {

    id: DictionaryId;
    name: string;
    order: number;
    enabled: boolean;
    source_language: string; // two-letter ISO 639-1
    target_language: string; // two-letter ISO 639-1    

    constructor( props: DictionaryConstructorProps ) {

        if (!props) return;

        this.id = props.id || Dictionary.createId();
        this.name = props.name;
        this.order = props.order;
        this.enabled = props.enabled;
        this.source_language = props.source_language;
        this.target_language = props.target_language;        
    }

    static create( input: DictionaryCreationInput ) {
        return new Dictionary({
            ...input
        });
    }

    static createId(): DictionaryId {
        return crypto.randomUUID();
    }
}