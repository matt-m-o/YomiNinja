import { randomUUID } from "crypto";

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
    copy_text_on_hover: true;
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
    ocr_adapter_name?: string;
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
                    border_color: 'red',
                    border_width: 1
                },
                ocr_item_box: {
                    background_color: 'black',
                    border_color: 'red',
                    border_radius: 10,
                    border_width: 1,
                    text: {
                        color: 'white',
                    }
                }
            },
            hotkeys: {
                ocr: 'Alt+S',
                copy_text: 'C',
                show: 'Alt+C',
                show_and_clear: 'Alt+V',
                ocr_on_screen_shot: true
            },
            behavior: {
                copy_text_on_hover: true
            }
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
    get ocr_adapter_name() { return this.props.ocr_adapter_name; }

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