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
    position: Position; // Percentages 0 ... 1
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
        return new OcrTargetRegion(input);
    }

    toPixels( 
        imageSize: {
            width: number;
            height: number;
        }
    ): OcrTargetRegion {

        const { width, height } = imageSize;
        
        const position: Position = {
            left: Math.round( this.position.left * width ),
            top: Math.round( this.position.top * height ),
        };

        const size: Size = {
            width: Math.round( this.size.width * width ),
            height: Math.round( this.size.height * height ),
        }

        return {
            ...this,
            position,
            size,
        };
    }

    static generateId(): OcrTemplateId {
        return crypto.randomUUID();
    }
};