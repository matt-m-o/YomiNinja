import { DictionaryId } from "../dictionary";
import MurmurHash3 from 'imurmurhash';

export type DictionaryTagId = number;

export type DictionaryTagConstructorProps = {
    id?: DictionaryTagId; // !change it to "number" later
    dictionary_id: DictionaryId;
    name: string;
    category: string;
    content: string; // note
    order: number; // for sorting
    popularity_score: number;
}

export interface DictionaryTagCreationInput extends Omit< DictionaryTagConstructorProps, 'id' > {};

// Entity based on Yomichan tag banks
export class DictionaryTag {

    id: DictionaryTagId; // !change it to "number" later
    dictionary_id: DictionaryId;
    name: string;
    category: string;
    content: string; // note
    order: number; // for sorting
    popularity_score: number;

    protected constructor( props: DictionaryTagConstructorProps ) {

        if (!props) return; // to prevent issues with ORMs

        this.id = props?.id || DictionaryTag.generateId({
            dictionary_id: props.dictionary_id,
            tag_name: props.name
        });

        this.dictionary_id = props.dictionary_id;
        this.name = props.name;
        this.category = props.category;
        this.content = props.content;
        this.order = props.order;
        this.popularity_score = props.popularity_score;
    }

    static create( input: DictionaryTagCreationInput ) {
        return new DictionaryTag({
            ...input,            
        });
    }

    // ! might change to a hashing function
    static generateId( input: { dictionary_id: DictionaryId, tag_name: string } ): DictionaryTagId {

        return MurmurHash3( input.dictionary_id+'/', 0x12345789 )            
            .hash( input.tag_name )
            .result();

        // return input.dictionary_id + '/' + input.tag_name;
    }
}