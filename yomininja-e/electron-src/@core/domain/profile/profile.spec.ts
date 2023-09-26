import { cloneDeep } from 'lodash';
import { Profile } from './profile';
import { SettingsPreset } from '../settings_preset/settings_preset';
import { Language } from '../language/language';

describe( "Profile tests", () => {

    const defaultSettings = SettingsPreset.create();
    const languageJa = Language.create({
        name: 'japanese',
        two_letter_code: 'ja',
    });

    it( "should define a Profile with default props", () => {

        const profile = Profile.create({
            active_settings_preset: defaultSettings,
            active_ocr_language: languageJa
        });

        expect( profile.id ).toBeDefined();
        expect( profile.name ).toStrictEqual( 'default' );
        expect( profile.active_settings_preset ).toStrictEqual( defaultSettings );
        expect( profile.active_ocr_language ).toStrictEqual( languageJa );
        expect( profile.created_at ).toBeDefined();
        expect( profile.updated_at ).toBeDefined();
    });

    it( "should define an Profile with custom name", () => {
        
        const profile = Profile.create({
            name: 'Profile 1',
            active_settings_preset: defaultSettings,
            active_ocr_language: languageJa,
        });

        expect( profile.id ).toBeDefined();
        expect( profile.name ).toStrictEqual( 'Profile 1' );
        expect( profile.active_settings_preset ).toStrictEqual( defaultSettings );
        expect( profile.active_ocr_language ).toStrictEqual( languageJa );
    });
    
});