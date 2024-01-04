import { randomUUID } from "crypto";
import { getDefaultSettingsPresetProps } from "./default_settings_preset_props";

export type DictionarySettings = {
    enabled: boolean;
};

export type OcrEngineSettings = {
    ocr_adapter_name?: string;
    image_scaling_factor: number; // from 0.1 to 2.0. Two decimal places shouldn't be allowed.
    max_image_width: number;
    cpu_threads: number;
    invert_colors: boolean;
    inference_runtime: string;
};

export type OverlayOcrRegionVisuals = {
    border_width: number;
};

export type OverlayOcrItemBoxVisuals = {
    border_color: string;
    border_width: number; // pixels
    border_radius: number; // pixels
    background_color: string;
    text: {
        color: string;
        font_size_factor: number; // 10% to 1000%
        letter_spacing: number;
    };
};

export type OverlayMouseVisuals = {
    show_custom_cursor: boolean;
    custom_cursor_size: number;
};

export type OverlayFrameVisuals = {
    border_color: string;
    border_width: number; // pixels
};

export type OverlayVisualCustomizations = {
    ocr_item_box: OverlayOcrItemBoxVisuals;
    frame: OverlayFrameVisuals;
    ocr_region: OverlayOcrRegionVisuals;
    mouse: OverlayMouseVisuals;
};

export type ClickThroughMode = 'auto' | 'enabled' | 'disabled';
export type ShowWindowOnCopy = {
    enabled: boolean;
    title: string;
};
export type OverlayBehavior = {
    copy_text_on_hover: boolean;
    copy_text_on_click: boolean;
    always_on_top: boolean;
    click_through_mode: ClickThroughMode;
    show_window_on_copy: ShowWindowOnCopy
    always_forward_mouse_clicks: boolean;
    show_window_without_focus: boolean;
    hide_results_on_blur: boolean;
};

export type OverlayHotkeys = {
    ocr: string;
    ocr_on_screen_shot: boolean; // Perform ocr when pressing "PrintScreen"
    copy_text: string;
    show: string;
    clear: string;
    toggle: string;
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
    dictionary: DictionarySettings;
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
        ...getDefaultSettingsPresetProps()
    };
    
    
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
                ...overlayUpdate.behavior,
            }
        };

        const { always_on_top, click_through_mode } = this.overlay.behavior

        if ( click_through_mode === 'disabled' )
            this.overlay.behavior.always_on_top = false;

        if ( always_on_top && click_through_mode === 'disabled' )
            this.overlay.behavior.click_through_mode = 'auto';
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

    updateDictionarySettings( update: Partial< DictionarySettings > ) {             

        this.props.dictionary = {
            ...this.props.dictionary,
            ...update,
        };
    }

    private ocrEngineImageScalingFactorValidation( imageScalingFactor?: number ) {
        if ( imageScalingFactor != undefined ) {

            // Minimum 0.1, Maximum 2
            imageScalingFactor = Math.max( 0.1, Math.min(2, imageScalingFactor ));

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