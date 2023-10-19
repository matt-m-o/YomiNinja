import crypto from 'crypto';

export type DictionaryId = string;

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

        if (!props) return;

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