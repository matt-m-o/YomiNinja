import crypto from 'crypto';
import { DictionaryTag } from "../dictionary_tag/dictionary_tag";
import { DictionaryHeadwordId } from '../dictionary_headword/dictionary_headword';

export interface DictionaryDefinitionId extends String {};

export type DictionaryDefinitionConstructorProps = {
    id?: DictionaryDefinitionId;
    dictionary_headword_id: DictionaryHeadwordId;
    definitions: string[];
    tags: DictionaryTag[];
    popularity_score: number;
    dictionary_id: string;
}

export interface DictionaryDefinitionCreationInput extends Omit< DictionaryDefinitionConstructorProps, 'id' > {};

// Entity based on Yomichan Term banks
export class DictionaryDefinition {

    id: DictionaryDefinitionId; // !change it to "number" later
    dictionary_headword_id: DictionaryHeadwordId;
    definitions: string[];
    tags: DictionaryTag[];
    popularity_score: number;
    dictionary_id: string;
    
    protected constructor( props: DictionaryDefinitionConstructorProps ) {

        this.id = props?.id || DictionaryDefinition.generateId();

        this.dictionary_headword_id = props.dictionary_headword_id;
        this.definitions = props.definitions;
        this.tags = props.tags;
        this.popularity_score = props.popularity_score;
        this.dictionary_id = props.dictionary_id;
    }

    static create( input: DictionaryDefinitionCreationInput ) {
        return new DictionaryDefinition({
            ...input,
        });
    }

    
    static generateId(): string {

        // ! might change to use a hashing function
        return crypto.randomUUID();
    }
}