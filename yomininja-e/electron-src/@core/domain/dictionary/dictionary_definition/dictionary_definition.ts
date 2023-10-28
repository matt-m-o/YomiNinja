import crypto from 'crypto';
import { DictionaryTag } from "../dictionary_tag/dictionary_tag";
import { DictionaryHeadword, DictionaryHeadwordId } from '../dictionary_headword/dictionary_headword';


export type DictionaryDefinitionId = number;

export type DictionaryDefinitionConstructorProps = {
    id?: DictionaryDefinitionId;
    dictionary_headword_id: DictionaryHeadwordId;
    definitions: string[];
    tags: DictionaryTag[];
    popularity_score: number;
    dictionary_id: string;
    headword?: DictionaryHeadword;
}

export interface DictionaryDefinitionCreationInput extends Omit<
    DictionaryDefinitionConstructorProps,
    'id'
> {};

// Entity based on Yomichan Term banks
export class DictionaryDefinition {

    id: DictionaryDefinitionId;
    dictionary_headword_id: DictionaryHeadwordId;
    definitions: string[];
    tags: DictionaryTag[];
    popularity_score: number;
    dictionary_id: string;
    headword?: DictionaryHeadword;
    
    protected constructor( props: DictionaryDefinitionConstructorProps ) {

        if (!props) return;

        this.dictionary_headword_id = props.dictionary_headword_id;
        this.definitions = props.definitions;
        this.tags = props.tags;
        this.popularity_score = props.popularity_score;
        this.dictionary_id = props.dictionary_id;
        this.headword = props?.headword;
        // this.id = props?.id || this.generateId();
    }

    static create( input: DictionaryDefinitionCreationInput ) {
        return new DictionaryDefinition({
            ...input,
        });
    }

}