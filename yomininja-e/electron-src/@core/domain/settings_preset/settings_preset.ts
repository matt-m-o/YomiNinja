import { OcrItem, OcrItemBox, OcrResult, OcrResultContextResolution } from "../ocr_result/ocr_result";

export type OverlayVisualCustomizations = {
    ocr_item_box: {
        border_color: string;
        border_width: number; // pixels
        border_radius: number; // pixels
        background_color: string;    
        text: {
            color: string;
        }
    },
    frame: {
        border_color: string;
        border_width: number; // pixels
    }
}

export type OverlaySettings = {
    visuals: OverlayVisualCustomizations;
    hotkeys: { 
        ocr: string;
        ocr_on_screen_shot: boolean; // Perform ocr when pressing "PrintScreen"
        copy_text: string;
        show: string;
        show_and_clear: string;
    },
}

export type SettingsPresetProps = {
    language_code: string; // ISO 639-1
    overlay: OverlaySettings;
    created_at: Date;
    update_at: Date;
};

export type SettingsPreset_CreationInput = {
    name?: string;
};

// Scalable version OcrResult. Uses percentages instead of pixel coordinates
export class SettingsPreset {

    public name: string = "default";
    private props: SettingsPresetProps = {
        language_code: 'ja',
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
            }
        },

        created_at: new Date(),
        update_at: new Date()
    }    
    
    
    private constructor( input?: SettingsPreset_CreationInput ) {

        if (input?.name)
            this.name = input.name;        
    }

    static create( input?: SettingsPreset_CreationInput ): SettingsPreset {
        return new SettingsPreset( input );
    }
    
    get language_code() { return this.props.language_code; }
    get overlay(){ return this.props.overlay; }

    set language_code( value: string ) {

        if ( value.length != 2 )
            return;

        this.props.language_code = value;
    }

    set overlay( update: OverlaySettings ) {

        this.props.overlay = {            

            visuals: {
                ...this.overlay.visuals,
                ...update.visuals,
            },

            hotkeys: {
                ...this.overlay.hotkeys,
                ...update.hotkeys
            }
        };
    }
}