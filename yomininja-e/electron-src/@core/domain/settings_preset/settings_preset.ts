import { randomUUID } from "crypto";

export type OcrEngineSettings = {
    ocr_adapter_name?: string;
    image_scaling_factor: number; // from 0.1 to 1.0. Two decimal places shouldn't be allow.
    max_image_width: number;
    cpu_threads: number;
    invert_colors: boolean;
};

export type OverlayOcrItemBoxVisuals = {
    border_color: string;
    border_width: number; // pixels
    border_radius: number; // pixels
    background_color: string;
    text: {
        color: string;
    };
};

export type OverlayFrameVisuals = {
    border_color: string;
    border_width: number; // pixels
};

export type OverlayVisualCustomizations = {
    ocr_item_box: OverlayOcrItemBoxVisuals;
    frame: OverlayFrameVisuals;
};

export type OverlayBehavior = {
    copy_text_on_hover: boolean;
    always_on_top: boolean;
    show_yomichan_window_on_copy: boolean;
};

export type OverlayHotkeys = {
    ocr: string;
    ocr_on_screen_shot: boolean; // Perform ocr when pressing "PrintScreen"
    copy_text: string;
    show: string;
    show_and_clear: string;    
};

export type OverlaySettings = {
    visuals: OverlayVisualCustomizations;
    hotkeys: OverlayHotkeys;
    behavior: OverlayBehavior;
};

export interface SettingsPresetProps {
    name: string;    
    overlay: OverlaySettings;
    ocr_engine: OcrEngineSettings;
    created_at: Date;
    updated_at: Date;
};



export interface SettingsPreset_CreationInput extends Partial< SettingsPresetProps > {
    name: string;    
};

// Stores general application settings
export class SettingsPreset {

    static default_name = 'default';

    public id: string; // ID
    private props: SettingsPresetProps = {
        name: SettingsPreset.default_name,        
        overlay: {
            visuals: {
                frame: {
                    border_color: "#e21212", // Red
                    border_width: 1
                },
                ocr_item_box: {
                    background_color: '#000000', // Black
                    border_color: "#e21212", // Red
                    border_radius: 10,
                    border_width: 1,
                    text: {
                        color: "#ffffff", // White
                    }
                }
            },
            hotkeys: {
                ocr: 'Alt+S',
                copy_text: 'undefined+C',
                show: 'Alt+C',
                show_and_clear: 'Alt+V',
                ocr_on_screen_shot: true,                
            },
            behavior: {
                copy_text_on_hover: true,
                always_on_top: true,
                show_yomichan_window_on_copy: true,
            }
        },
        ocr_engine: {
            image_scaling_factor: 1,
            max_image_width: 1600,
            cpu_threads: 8,
            invert_colors: false,
        },

        created_at: new Date(),
        updated_at: new Date()
    }    
    
    
    private constructor( input?: SettingsPreset_CreationInput, id?: string ) {

        this.id = id || randomUUID();        

        if (input) {
            this.props = {
                ...this.props,
                ...input,
            };
        }
        
    }

    static create( input?: SettingsPreset_CreationInput ): SettingsPreset {
        return new SettingsPreset( input );
    }
    
    get name(){ return this.props.name; }    
    get overlay(){ return this.props.overlay; }
    get ocr_engine() { return this.props.ocr_engine; }

    get created_at(){ return this.props.created_at; }
    get updated_at(){ return this.props.updated_at; }


    set name( value: string ){ this.props.name = value; }

    protected set overlay( update: OverlaySettings ) {

        this.props.overlay = {

            ...this.overlay,
            ...update,

            visuals: {
                ...this.overlay.visuals,
                ...update.visuals,
            },

            hotkeys: {
                ...this.overlay.hotkeys,
                ...update.hotkeys
            },

            behavior: {
                ...this.overlay.behavior,
                ...update.behavior
            }
        };
    }

    protected set ocr_engine( data: OcrEngineSettings ){ this.props.ocr_engine = data; }
    
    protected set created_at( date: Date ){ this.props.created_at = date; }
    protected set updated_at( date: Date ){ this.props.updated_at = date; }


    updateOverlaySettings( overlayUpdate: Partial< OverlaySettings > ) {

        this.overlay = {

            ...this.overlay,
            ...overlayUpdate,

            visuals: {
                ...this.overlay.visuals,
                ...overlayUpdate.visuals,
            },

            hotkeys: {
                ...this.overlay.hotkeys,
                ...overlayUpdate.hotkeys
            },

            behavior: {
                ...this.overlay.behavior,
                ...overlayUpdate.behavior
            }
        };
    }

    updateOcrEngineSettings( update: Partial< OcrEngineSettings > ) {

        let { image_scaling_factor, max_image_width } = update;

        image_scaling_factor = this.ocrEngineImageScalingFactorValidation( image_scaling_factor );

        max_image_width = this.ocrEngineMaxImageWidthValidation( max_image_width );

        this.props.ocr_engine = {
            ...this.props.ocr_engine,
            ...update,
            image_scaling_factor,
            max_image_width
        };
    }

    private ocrEngineImageScalingFactorValidation( imageScalingFactor?: number ) {
        if ( imageScalingFactor != undefined ) {

            // Minimum 0.1, Maximum 1
            imageScalingFactor = Math.max( 0.1, Math.min(1, imageScalingFactor ));

            // Ensure 1 decimal place of precision
            imageScalingFactor = Math.round( imageScalingFactor * 100) / 100;
        }
        else {
            imageScalingFactor = this.ocr_engine.image_scaling_factor;
        }

        return imageScalingFactor;
    }

    private ocrEngineMaxImageWidthValidation( maxImageWidth?: number ) {        

        if ( 
            !maxImageWidth ||
            maxImageWidth % 32 != 0 || // Must be multiple of 32
            maxImageWidth < 0
        )
            return this.ocr_engine.max_image_width;        

        return maxImageWidth;
    }

    toJson(): SettingsPresetJson {
        return {
            id: this.id,
            ...this.props,
        }
    }
}

export interface SettingsPresetJson extends SettingsPresetProps {
    id: string;
}