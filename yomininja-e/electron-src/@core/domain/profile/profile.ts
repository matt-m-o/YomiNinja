import { randomUUID } from "crypto";
import { SettingsPreset } from "../settings_preset/settings_preset";
import { Language } from "../language/language";

export interface ProfileProps {
    name: string;
    active_settings_preset: SettingsPreset;
    // app_language: string; // Application display language
    active_ocr_language: Language;
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
    
    get created_at(){ return this.props.created_at; }
    get updated_at(){ return this.props.updated_at; }


    set name( value: string ){ this.props.name = value; }

    set active_settings_preset( value: SettingsPreset ) {

        this.props.active_settings_preset = value;
    }

    set active_ocr_language( value: Language ) {        

        this.props.active_ocr_language = value;
    }
    
    protected set created_at( date: Date ){ this.props.created_at = date; }
    protected set updated_at( date: Date ){ this.props.updated_at = date; }
}