import crypto from 'crypto';
import { OcrTemplate, OcrTemplateId } from '../ocr_template';

export type OcrTargetRegionId = string;

type Position = {
    top: number;
    left: number;
};

type Size = {
    width: number;
    height: number;
};

type AutoOcrOptions = {
    enabled: boolean;
    motion_sensitivity: number;
}

type TextToSpeechOptions = {
    voice_uri: string;
    automatic: boolean;
    on_hover: boolean;
    on_click: boolean;
    volume: number; // 0.0 -> 1.0
}

export type OcrTargetRegionConstructorProps = {
    id?: OcrTargetRegionId;
    ocr_template_id: OcrTemplateId;
    ocr_template?: OcrTemplate;
    position: Position; // Percentages 0 ... 1
    size: Size; // Percentages 
    angle?: number; // degrees
    auto_ocr_options?: AutoOcrOptions;
    text_to_speech_options?: TextToSpeechOptions;
};

export interface OcrTargetRegionCreationInput extends Omit<
    OcrTargetRegionConstructorProps,
    'created_at' | 
    'updated_at'
> {};

export class OcrTargetRegion {

    id: OcrTargetRegionId;
    ocr_template_id: OcrTemplateId;
    ocr_template?: OcrTemplate;
    position: Position; // Percentages
    size: Size; // Percentages
    angle: number; // degrees
    auto_ocr_options: AutoOcrOptions;
    text_to_speech_options: TextToSpeechOptions;

    constructor( props: OcrTargetRegionConstructorProps ) {

        if ( !props ) return;

        if ( props?.id ) {
            this.id = props?.id;
        }
        else if ( props?.ocr_template_id ) {
            this.id = OcrTargetRegion.generateId({
                ocrTemplateId: props.ocr_template_id
            });
        }

        if ( props.ocr_template )
            this.ocr_template = props.ocr_template;

        this.ocr_template_id = props.ocr_template_id;
        this.position = props.position;
        this.size = props.size;
        this.angle = props?.angle || 0;
        this.auto_ocr_options = {
            enabled: Boolean( props.auto_ocr_options?.enabled ),
            motion_sensitivity: props.auto_ocr_options?.motion_sensitivity || 300_000 
        }

        const volume = props.text_to_speech_options?.volume !== undefined ?
            props.text_to_speech_options?.volume :
            1;

        this.text_to_speech_options = {
            voice_uri: props.text_to_speech_options?.voice_uri || '',
            automatic: Boolean( props.text_to_speech_options?.automatic ),
            on_click: Boolean( props.text_to_speech_options?.on_click ),
            on_hover: Boolean( props.text_to_speech_options?.on_hover ),
            volume,
        }
    }

    static create( input: OcrTargetRegionCreationInput ): OcrTargetRegion {
        return new OcrTargetRegion( input );
    }

    toPixels( 
        imageSize: {
            width: number;
            height: number;
        }
    ): OcrTargetRegion {

        const { width, height } = imageSize;
        
        const position: Position = {
            left: Math.floor( this.position.left * width ),
            top: Math.floor( this.position.top * height ),
        };

        const size: Size = {
            width: Math.floor( this.size.width * width ),
            height: Math.floor( this.size.height * height ),
        }

        return {
            ...this,
            position,
            size,
        };
    }

    toJson(): OcrTargetRegionJson {
        return {
            id: this.id,
            ocr_template_id: this.ocr_template_id,
            ocr_template: this?.ocr_template,
            position: this.position,
            size: this.size,
            angle: this.angle,
            auto_ocr_options: this.auto_ocr_options,
            text_to_speech_options: this.text_to_speech_options,
        };
    }

    static generateId( input: { ocrTemplateId: OcrTemplateId }) {
        const randomNumber = Math.floor( Math.random() * 1000000 );
        return input.ocrTemplateId + '/' + randomNumber;
    }
};

export interface OcrTargetRegionJson extends Omit< 
    OcrTargetRegionConstructorProps,
    'id' | 'angle'
> {
    id: OcrTargetRegionId;
    angle: number;
};