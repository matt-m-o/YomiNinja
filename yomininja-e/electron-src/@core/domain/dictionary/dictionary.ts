import crypto from 'crypto';
import MurmurHash3 from 'imurmurhash';

export type DictionaryId = number;

export type DictionaryConstructorProps = {
    id?: DictionaryId;
    name: string;
    version?: string;
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
    version?: string;
    order: number;
    enabled: boolean;
    source_language: string; // two-letter ISO 639-1
    target_language: string; // two-letter ISO 639-1    

    constructor( props: DictionaryConstructorProps ) {

        if (!props) return;

        // this.id = props.id || Dictionary.generateId({ dictionaryId: props.name });
        this.name = props.name;
        this.version = props.version; 
        this.order = props.order;
        this.enabled = props.enabled;
        this.source_language = props.source_language;
        this.target_language = props.target_language;        
    }

    static create( input: DictionaryCreationInput ) {
        return new Dictionary({
            ...input,
        });
    }

    
    static generateId( input: { dictionaryId: string } ): DictionaryId {

        return MurmurHash3( input.dictionaryId, 0x12345789 )            
            .result();

        // return crypto.randomUUID();
    }
}