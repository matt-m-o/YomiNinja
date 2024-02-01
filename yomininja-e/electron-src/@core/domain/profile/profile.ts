import { randomUUID } from "crypto";
import { SettingsPreset, SettingsPresetJson } from "../settings_preset/settings_preset";
import { Language, LanguageJson } from "../language/language";
import { OcrTemplate } from "../ocr_template/ocr_template";

export interface ProfileProps {
    name: string;
    active_settings_preset: SettingsPreset;
    // app_language: string; // Application display language
    active_ocr_language: Language;
    active_ocr_template: OcrTemplate | null;
    created_at: Date;
    updated_at: Date;
};



export interface Profile_CreationInput extends Partial< ProfileProps > {
    active_settings_preset: SettingsPreset;
    active_ocr_language: Language;
};

// Stores all application configuration
export class Profile {

    static default_name = 'default';

    public id: string; // ID
    private props: ProfileProps;
    
    
    private constructor( input: Profile_CreationInput, id?: string ) {

        this.id = id || randomUUID();
        
        this.props = {            
            ...input,
            name: input?.name || Profile.default_name,
            active_ocr_template: input?.active_ocr_template || null,
            created_at: new Date(),
            updated_at: new Date()
        };
    }

    static create( input: Profile_CreationInput ): Profile {
        return new Profile( input );
    }
    
    get name(){ return this.props.name; }
    get active_settings_preset() { return this.props.active_settings_preset; }
    get active_ocr_language(){ return this.props.active_ocr_language; }
    get active_ocr_template(): OcrTemplate | null {
        return this.props.active_ocr_template;
    }
    
    get created_at(){ return this.props.created_at; }
    get updated_at(){ return this.props.updated_at; }


    set name( value: string ){ this.props.name = value; }

    set active_settings_preset( value: SettingsPreset ) {
        this.props.active_settings_preset = value;
    }

    set active_ocr_language( value: Language ) {

        this.props.active_ocr_language = value;
    }

    set active_ocr_template( value: OcrTemplate | null ) {        

        this.props.active_ocr_template = value;
    }
    
    protected set created_at( date: Date ){ this.props.created_at = date; }
    protected set updated_at( date: Date ){ this.props.updated_at = date; }

    toJson(): ProfileJson {
        return {
            id: this.id,
            ...this.props,
            active_ocr_language: this.active_ocr_language.toJson(),
            active_settings_preset: this.active_settings_preset.toJson(),
        }
    }
}

export interface ProfileJson extends Omit< 
    ProfileProps,
    'active_ocr_language' | 'active_settings_preset'
> {
    id: string;
    name: string;
    active_ocr_language: LanguageJson,
    active_settings_preset: SettingsPresetJson,
}