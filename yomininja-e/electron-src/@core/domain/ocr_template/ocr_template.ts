import { OcrTargetRegion, OcrTargetRegionId } from "./ocr_target_region/ocr_target_region";
import crypto from 'crypto';

export type OcrTemplateId = string;

export type OcrTemplateConstructorProps = {
    id?: OcrTemplateId;
    name: string;
    target_regions: OcrTargetRegion[];
    image: Buffer;
    capture_source_name?: string;
    created_at: Date;
    updated_at: Date;
};

export interface OcrTemplateCreationInput extends Omit<
    OcrTemplateConstructorProps,
    'id' |
    'target_regions' |
    'created_at' |
    'updated_at'
> {
    target_regions?: OcrTargetRegion[];
};

export class OcrTemplate {

    id: OcrTemplateId;
    name: string;
    target_regions: OcrTargetRegion[];
    image: Buffer;
    capture_source_name: string | null;
    created_at: Date;
    updated_at: Date;

    constructor( props: OcrTemplateConstructorProps ) {

        if ( !props ) return;

        this.id = props?.id || OcrTemplate.generateId();

        this.name = props.name;
        this.target_regions = props?.target_regions || [];
        this.image = props.image;
        this.capture_source_name = props?.capture_source_name || null;
        this.created_at = props.created_at;
        this.updated_at = props.updated_at;

        this.target_regions.forEach( item => {
            item.ocr_template_id = this.id;
        });
    }

    static create( input: OcrTemplateCreationInput ): OcrTemplate {
        return new OcrTemplate({
            ...input,
            target_regions: input.target_regions || [],
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    addTargetRegion( targetRegion: OcrTargetRegion ) {

        const exists = this.target_regions.some( item => {
            return item.id === targetRegion.id;
        });

        if ( exists ) return;

        targetRegion.ocr_template_id = this.id;

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

    nullCheck() {
        this.target_regions = this.target_regions || [];
    }
};