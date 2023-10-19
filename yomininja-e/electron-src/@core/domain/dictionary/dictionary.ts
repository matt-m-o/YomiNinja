import crypto from 'crypto';

export interface DictionaryId extends String {};

export type DictionaryConstructorProps = {
    id?: DictionaryId;
    name: string;
    order: number;
    enabled: boolean;
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

    constructor( props: DictionaryConstructorProps ) {

        this.id = props.id || Dictionary.createId();
        this.name = props.name;
        this.order = props.order;
        this.enabled = props.enabled;
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