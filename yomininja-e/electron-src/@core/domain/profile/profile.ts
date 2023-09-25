import { randomUUID } from "crypto";
import { SettingsPreset } from "../settings_preset/settings_preset";

export interface ProfileProps {
    name: string;
    active_settings_preset: SettingsPreset;
    // app_language: string; // Application display language
    ocr_language_code: string; // TODO: Implement and use language entity

    created_at: Date;
    updated_at: Date;
};



export interface Profile_CreationInput extends Partial< ProfileProps > {    
    active_settings_preset: SettingsPreset;
};

// Stores all application configuration
export class Profile {

    static default_name = 'default';

    public id: string; // ID
    private props: ProfileProps;
    
    
    private constructor( input: Profile_CreationInput, id?: string ) {

        this.id = id || randomUUID();
        
        this.props = {
            ocr_language_code: 'ja',
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
    get ocr_language_code(){ return this.props.ocr_language_code; }
    
    get created_at(){ return this.props.created_at; }
    get updated_at(){ return this.props.updated_at; }


    set name( value: string ){ this.props.name = value; }

    set active_settings_preset( value: SettingsPreset ) {

        this.props.active_settings_preset = value;
    }

    set ocr_language_code( value: string ) {        

        this.props.ocr_language_code = value;
    }
    
    protected set created_at( date: Date ){ this.props.created_at = date; }
    protected set updated_at( date: Date ){ this.props.updated_at = date; }
}