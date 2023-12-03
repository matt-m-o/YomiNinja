import { OcrTargetRegion, OcrTargetRegionId } from "./ocr_target_region/ocr_target_region";
import crypto from 'crypto';

export type OcrTemplateId = string;

export type OcrTemplateConstructorProps = {
    id?: OcrTemplateId;
    name: string;
    ocr_target_regions: OcrTargetRegion[];
    image: Buffer;
    capture_source_name?: string;
};

export interface OcrTemplateCreationInput extends Omit<
    OcrTemplateConstructorProps,
    'id' | 'ocr_target_regions' | 'capture_source_name'
> {
    ocr_target_regions?: OcrTargetRegion[];
    capture_source_name?: string;
};

export class OcrTemplate {

    id: OcrTemplateId;
    name: string;
    target_regions: OcrTargetRegion[];
    image: Buffer;
    capture_source_name?: string;

    constructor( props: OcrTemplateConstructorProps ) {

        if ( !props ) return;

        this.id = props?.id || OcrTemplate.generateId();

        this.name = props.name;
        this.target_regions = props.ocr_target_regions;
        this.image = props.image;
        this.capture_source_name = props.capture_source_name;
    }

    static create( input: OcrTemplateCreationInput ): OcrTemplate {
        return new OcrTemplate({
            ...input,
            ocr_target_regions: input.ocr_target_regions || []
        });
    }

    addTargetRegion( targetRegion: OcrTargetRegion ) {

        const exists = this.target_regions.some( item => {
            return item.id === targetRegion.id;
        });

        if ( exists ) return;

        this.target_regions.push( targetRegion );
    }

    removeTargetRegion( targetRegionId: OcrTargetRegionId ) {

        const idx = this.target_regions.findIndex(
            item => item.id === targetRegionId
        );

        if ( idx < 0 ) return;

        this.target_regions.splice( idx, 1 );
    }

    static generateId(): OcrTemplateId {
        return crypto.randomUUID();
    }
};