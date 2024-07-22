import { OcrTargetRegion, OcrTargetRegionId, OcrTargetRegionJson } from "./ocr_target_region/ocr_target_region";

export type OcrTemplateId = number;

export type CapturerOptions = {
    interval_between_frames: number;
};

export type OcrTemplateConstructorProps = {
    id?: OcrTemplateId;
    name: string;
    target_regions: OcrTargetRegion[];
    image: Buffer;
    capture_source_name?: string | null;
    capturer_options?: CapturerOptions | null;
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
    id?: OcrTemplateId,
    target_regions?: OcrTargetRegion[];
};

export class OcrTemplate {

    id: OcrTemplateId;
    name: string;
    target_regions: OcrTargetRegion[];
    image: Buffer;
    capture_source_name: string | null;
    capturer_options: CapturerOptions | null;
    created_at: Date;
    updated_at: Date;

    constructor( props: OcrTemplateConstructorProps ) {

        if ( !props ) return;

        if ( props?.id )
            this.id = props?.id;

        this.name = props.name;
        this.target_regions = props?.target_regions || [];
        this.image = props.image;
        this.capture_source_name = props?.capture_source_name || null;
        this.capturer_options = props?.capturer_options || null;
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

    updateTargetRegion( targetRegion: OcrTargetRegion ) {

        for( let item of this.target_regions  ) {

            if ( item.id !== targetRegion.id )
                continue;

            targetRegion.ocr_template_id = this.id;
            item = targetRegion;
        }
    }

    removeTargetRegion( targetRegionId: OcrTargetRegionId ) {

        const idx = this.target_regions.findIndex(
            item => item.id === targetRegionId
        );

        if ( idx < 0 ) return;

        this.target_regions.splice( idx, 1 );
    }

    getTargetRegion( targetRegionId: OcrTargetRegionId ): OcrTargetRegion | undefined  {
        return this.target_regions.find( item => item.id === targetRegionId );
    }

    nullCheck() {
        this.target_regions = this.target_regions || [];
    }

    isAutoOcrEnabled(): boolean {
        for ( const region of this.target_regions ) {
            if ( region?.auto_ocr_options?.enabled )
                return true;
        }

        return false;
    }

    toJson(): OcrTemplateJson {
        return {
            id: this.id,
            name: this.name,
            image: this.image,
            image_base64: this.image.toString('base64'),
            target_regions: this.target_regions.map( item => item.toJson() ),
            capture_source_name: this.capture_source_name,
            capturer_options: this.capturer_options,
            created_at: this.created_at,
            updated_at: this.updated_at,
        };
    }
};

export interface OcrTemplateJson extends Required<
    Omit< 
        OcrTemplateConstructorProps,
        'target_regions'
    >
> {
    image_base64: string,
    target_regions: OcrTargetRegionJson[];
};