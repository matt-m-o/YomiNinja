import { DictionaryDefinition } from "../dictionary_definition/dictionary_definition";
import { DictionaryTag } from "../dictionary_tag/dictionary_tag";
import MurmurHash3 from "imurmurhash";


export type DictionaryHeadwordId = number;



export type DictionaryHeadwordConstructorProps = {
    id?: DictionaryHeadwordId;
    term: string;
    reading: string;
    definitions: DictionaryDefinition[];
    tags: DictionaryTag[];
    furigana?: string;
}

export interface DictionaryHeadwordCreationInput extends Omit<
    DictionaryHeadwordConstructorProps,
    'id' | 'definitions' | 'tags' | 'furigana'
> {
    definitions?: DictionaryDefinition[];
    tags?: DictionaryTag[];
    furigana?: string;
};

// Entity represent the a dictionary Headword or Heading ( unique combination of a "term" and "reading" )
export class DictionaryHeadword {
    
    id: DictionaryHeadwordId;
    term: string;
    reading: string;
    definitions: DictionaryDefinition[];
    tags: DictionaryTag[];
    furigana?: string | null;

    term_length: number;
    reading_length: number;

    protected constructor( props: DictionaryHeadwordConstructorProps ) {

        if (!props) return;

        this.id = props?.id || DictionaryHeadword.generateId({
            term: props.term,
            reading: props.reading,
        });

        this.term = props.term,
        this.reading = props.reading;
        this.definitions = props?.definitions || [];
        this.tags = props?.tags || [];
        this.furigana = props?.furigana || null;

        this.term_length = this.term.length;
        this.reading_length = this.reading.length;
    }

    static create( input: DictionaryHeadwordCreationInput ) {
        return new DictionaryHeadword({
            ...input,
            definitions: input?.definitions || [],
            tags: input?.tags || [],
            furigana: input?.furigana
        });
    }

    addDefinition( definition: DictionaryDefinition ) {

        // if ( definition.dictionary_headword_id !== this.id )
        //     return;

        this.definitions.push( definition );
    }

    addTag( tag: DictionaryTag ) {
        this.tags.push( tag );
    }

    setFurigana( furigana: string ) {
        this.furigana = furigana;
    }

    getPopularityScore(): number {      

        return Math.max(
            ...this.definitions.map( definition => definition.popularity_score ),
            0
        );    
    }

    nullCheck() {
        this.definitions = this.definitions || [];
        this.tags = this.tags || [];
    }

    static generateId( input: { term: string, reading: string } ): DictionaryHeadwordId {
        
        return MurmurHash3( input.term+'/', 0x12345789 )
            .hash( input.reading )
            .result();
            
        // return input.term + '/' + input.reading;
    }
}