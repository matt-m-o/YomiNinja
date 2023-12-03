import crypto from 'crypto';

export type OcrTargetRegionId = string;

type Position = {
    top: number;
    left: number;
};

type Size = {
    width: number;
    height: number;
};


export type OcrTemplateId = string;

export type OcrTargetRegionConstructorProps = {
    id?: string;
    position: Position; // Percentages
    size: Size; // Percentages
    // angle: number; // degrees
};

export interface OcrTargetRegionCreationInput extends OcrTargetRegionConstructorProps {};

export class OcrTargetRegion {

    id: OcrTargetRegionId;
    position: Position; // Percentages
    size: Size; // Percentages
    // angle: number; // degrees

    constructor( props: OcrTargetRegionConstructorProps ) {

        if ( !props ) return;

        this.id = props?.id || OcrTargetRegion.generateId();

        this.position = props.position;
        this.size = props.size;
    }

    static create( input: OcrTargetRegionCreationInput ): OcrTargetRegion {
        return new OcrTargetRegion({
            ...input
        });
    }

    static generateId(): OcrTemplateId {
        return crypto.randomUUID();
    }
};