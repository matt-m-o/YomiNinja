import { SettingsPreset } from "./settings_preset";
import { cloneDeep } from 'lodash';

describe( "SettingsPreset tests", () => {

    it( "should define a SettingsPreset with default props", () => {

        const settingsPreset = SettingsPreset.create();

        expect( settingsPreset.id ).toBeDefined();
        expect( settingsPreset.name ).toStrictEqual( 'default' );        
        expect( settingsPreset.created_at ).toBeDefined();
        expect( settingsPreset.updated_at ).toBeDefined();
    });

    it( "should define a SettingsPreset with custom name", () => {
        
        const settingsPreset = SettingsPreset.create({ name: 'custom 1' });

        expect( settingsPreset.id ).toBeDefined();
        expect( settingsPreset.name ).toStrictEqual( 'custom 1' );       
    });
    

    it( "should define a SettingsPreset and change overlay settings", () => {
        
        const settingsPreset = SettingsPreset.create({ name: 'custom 1' });        

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

        expect( settingsPreset.overlay.hotkeys.copy_text )
            .toStrictEqual( 'Ctrl+C' );

        expect( settingsPreset.overlay.hotkeys.ocr )
            .toStrictEqual( oldOverlaySettings.hotkeys.ocr );

        expect( settingsPreset.overlay.visuals.frame.border_color )
            .toStrictEqual( 'blue' );

        expect( settingsPreset.overlay.visuals.frame.border_width )
            .toStrictEqual( oldOverlaySettings.visuals.frame.border_width );
    });

});