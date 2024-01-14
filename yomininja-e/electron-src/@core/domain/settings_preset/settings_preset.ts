import { randomUUID } from "crypto";

export type DictionarySettings = {
    enabled: boolean;
};

export interface OcrEngineSettings {
    ocr_adapter_name: string;
    image_scaling_factor: number; // from 0.1 to 2.0. Two decimal places shouldn't be allowed.
    invert_colors: boolean;
    hotkey: string;
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
        font_size_factor: number; // %
        letter_spacing: number;
        character_positioning: boolean; // Individual character positioning
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
    ocr: string; // For the selected ocr adapter
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



export interface SettingsPresetProps < TOcrSettings extends OcrEngineSettings = OcrEngineSettings > {
    name: string;
    overlay: OverlaySettings;
    ocr_engines: TOcrSettings[];
    dictionary: DictionarySettings;
    created_at: Date;
    updated_at: Date;
};


export interface SettingsPreset_CreationInput extends SettingsPresetProps {
    name: string;    
};



// Stores general application settings
export class SettingsPreset < TProps extends SettingsPresetProps = SettingsPresetProps > {

    static default_name = 'default';

    public id: string; // ID
    private props: TProps;
    
    
    constructor( input?: Partial< TProps >, id?: string ) {

        this.id = id || randomUUID();

        this.props = {
            name: SettingsPreset.default_name,
            dictionary: {
                enabled: false,
            },
            ocr_engines: [],
            overlay: {},
            created_at: new Date(),
            updated_at: new Date(),
        } as unknown as TProps;

        if (input) {
            this.props = {
                ...this.props,
                ...input,
            };
        }
    }

    static create< TProps extends SettingsPresetProps >(
        input?: Partial< TProps > & { name: string }
    ): SettingsPreset< TProps > {
        return new SettingsPreset<TProps>( input );
    }
    
    get name(){ return this.props.name; }    
    get overlay(){ return this.props.overlay; }
    get ocr_engines() { return this.props.ocr_engines; }

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

    public set ocr_engines( data: OcrEngineSettings[] ) { this.props.ocr_engines = data; }
    
    protected set created_at( date: Date ){ this.props.created_at = date; }
    protected set updated_at( date: Date ){ this.props.updated_at = date; }

    getOcrEngineSettings< T extends OcrEngineSettings >( adapterName: string ): T | undefined {
        
        if ( !Array.isArray( this.props.ocr_engines ) )
            this.props.ocr_engines = [];

        const engineSettings = this.props.ocr_engines?.find(
            item => item.ocr_adapter_name === adapterName
        );

        if ( !engineSettings ) return;

        return engineSettings as T;
    }

    handleOldOcrSettings() {
        if ( !Array.isArray( this.props.ocr_engines ) )
            this.props.ocr_engines = [];
    }


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

    updateOcrEngineSettings(
        update: { ocr_adapter_name: string } & Partial< OcrEngineSettings >
    ) {

        // let { image_scaling_factor, max_image_width } = update;

        // image_scaling_factor = this.ocrEngineImageScalingFactorValidation( image_scaling_factor );

        // max_image_width = this.ocrEngineMaxImageWidthValidation( max_image_width );

        this.ocr_engines = this.ocr_engines.map( engineSettings => {

            if ( engineSettings.ocr_adapter_name === update.ocr_adapter_name ) {
                engineSettings = {
                    ...engineSettings,
                    ...update,
                };
            }

            return engineSettings
        });
    }

    updateDictionarySettings( update: Partial< DictionarySettings > ) {             

        this.props.dictionary = {
            ...this.props.dictionary,
            ...update,
        };
    }

    // Move to another layer
    /* private ocrEngineImageScalingFactorValidation( imageScalingFactor?: number ) {
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
    } */

    // Move to another layer
    /* private ocrEngineMaxImageWidthValidation( maxImageWidth?: number ) {        

        if ( 
            !maxImageWidth ||
            maxImageWidth % 32 != 0 || // Must be multiple of 32
            maxImageWidth < 0
        )
            return this.ocr_engine.max_image_width;        

        return maxImageWidth;
    } */

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