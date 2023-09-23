import { SettingsPreset } from "./settings_preset";
import { cloneDeep } from 'lodash';

describe( "SettingsPreset tests", () => {

    it( "should define a SettingsPreset with default props", () => {

        const settingsPreset = SettingsPreset.create();

        expect( settingsPreset.id ).toBeDefined();
        expect( settingsPreset.name ).toStrictEqual( 'default' );
        expect( settingsPreset.language_code ).toHaveLength( 2 );
        expect( settingsPreset.created_at ).toBeDefined();
        expect( settingsPreset.updated_at ).toBeDefined();
    });

    it( "should define an SettingsPreset with custom name", () => {
        
        const settingsPreset = SettingsPreset.create({ name: 'custom 1' });

        expect( settingsPreset.id ).toBeDefined();
        expect( settingsPreset.name ).toStrictEqual( 'custom 1' );
        expect( settingsPreset.language_code ).toHaveLength( 2 );
    });
    

    it( "should define an SettingsPreset and change overlay settings and language code", () => {
        
        const settingsPreset = SettingsPreset.create({ name: 'custom 1' });

        settingsPreset.language_code = 'ch';
        expect( settingsPreset.language_code ).toStrictEqual( 'ch' );

        const oldOverlaySettings = cloneDeep( settingsPreset.overlay );

        settingsPreset.updateOverlaySettings({

            hotkeys: {
                ...settingsPreset.overlay.hotkeys,
                copy_text: 'Ctrl+C'
            },
            visuals: {
                ...settingsPreset.overlay.visuals,
                frame: {
                    ...settingsPreset.overlay.visuals.frame,
                    border_color: 'blue',
                },        
            },
            
        });

        expect( settingsPreset.language_code ).toHaveLength( 2 );

        expect( settingsPreset.overlay.hotkeys.copy_text )
            .toStrictEqual( 'Ctrl+C' );

        expect( settingsPreset.overlay.hotkeys.ocr )
            .toStrictEqual( oldOverlaySettings.hotkeys.ocr );

        expect( settingsPreset.overlay.visuals.frame.border_color )
            .toStrictEqual( 'blue' );

        expect( settingsPreset.overlay.visuals.frame.border_width )
            .toStrictEqual( oldOverlaySettings.visuals.frame.border_width );
    });

    it( "should NOT allow invalid language codes", () => {
        
        const settingsPreset = SettingsPreset.create({ name: 'custom 1' });
        
        settingsPreset.language_code = "jap";
        expect( settingsPreset.language_code ).toHaveLength( 2 );

        settingsPreset.language_code = "j";
        expect( settingsPreset.language_code ).toHaveLength( 2 );

        settingsPreset.language_code = "";
        expect( settingsPreset.language_code ).toHaveLength( 2 );
    });
});