import { SettingsPreset } from "./settings_preset";
import { cloneDeep } from 'lodash';

describe( "SettingsPreset tests", () => {

    it( "should define a SettingsPreset with default props", () => {

        const settingsPreset = SettingsPreset.create();

        expect( settingsPreset.id ).toBeDefined();
        expect( settingsPreset.name ).toStrictEqual( 'default' );
        expect( settingsPreset.ocr_engine ).toBeDefined();
        expect( settingsPreset.created_at ).toBeDefined();
        expect( settingsPreset.updated_at ).toBeDefined();


        const { image_scaling_factor } = settingsPreset.ocr_engine;

        expect( image_scaling_factor ).toBeGreaterThanOrEqual( 0.1 );
        expect( image_scaling_factor ).toBeLessThanOrEqual( 1 );
        expect( image_scaling_factor.toString().length ).toBeLessThan( 3 );
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


    it( "should define a SettingsPreset and change image_scaling_factor, while preventing invalid values", () => {
        
        const settingsPreset = SettingsPreset.create({ name: 'custom 1' });        

        const oldOcrEngineSettings = cloneDeep( settingsPreset.ocr_engine );

        // Prevent image_scaling_factor to be undefined
        settingsPreset.updateOcrEngineSettings({});
        expect( settingsPreset.ocr_engine.image_scaling_factor )
            .toStrictEqual( oldOcrEngineSettings.image_scaling_factor );


        // Prevent image_scaling_factor to be greater than 1
        settingsPreset.updateOcrEngineSettings({
            image_scaling_factor: 1.1
        });
        expect( settingsPreset.ocr_engine.image_scaling_factor )
            .toStrictEqual( 1 );

        // Prevent image_scaling_factor to be less than 0.1
        settingsPreset.updateOcrEngineSettings({
            image_scaling_factor: 0.08
        });
        expect( settingsPreset.ocr_engine.image_scaling_factor )
            .toStrictEqual( 0.1 );

        // Prevent image_scaling_factor from having more than 2 decimal place
        settingsPreset.updateOcrEngineSettings({
            image_scaling_factor: 0.155
        });
        expect( settingsPreset.ocr_engine.image_scaling_factor )
            .toStrictEqual( 0.16 );            

        // Allow image_scaling_factor to be great
        settingsPreset.updateOcrEngineSettings({
            image_scaling_factor: 0.8
        });
        expect( settingsPreset.ocr_engine.image_scaling_factor )
            .toStrictEqual( 0.8 );

    });


    it( "should define a SettingsPreset and change max_image_width, while preventing invalid values", () => {
        
        const settingsPreset = SettingsPreset.create({ name: 'custom 1' });        

        const oldOcrEngineSettings = cloneDeep( settingsPreset.ocr_engine );

        // Prevent max_image_width from being not multiple of 32
        settingsPreset.updateOcrEngineSettings({
            max_image_width: 1270
        });
        expect( settingsPreset.ocr_engine.max_image_width )
            .toStrictEqual( oldOcrEngineSettings.max_image_width );


        // Prevent max_image_width from being a float
        settingsPreset.updateOcrEngineSettings({
            max_image_width: 1280.5
        });
        expect( settingsPreset.ocr_engine.max_image_width )
            .toStrictEqual( oldOcrEngineSettings.max_image_width );


        // Prevent max_image_width from being a float
        settingsPreset.updateOcrEngineSettings({
            max_image_width: 1280.5
        });
        expect( settingsPreset.ocr_engine.max_image_width )
            .toStrictEqual( oldOcrEngineSettings.max_image_width );

      
        // Prevent max_image_width from being undefined
        settingsPreset.updateOcrEngineSettings({
            max_image_width: undefined
        });
        expect( settingsPreset.ocr_engine.max_image_width )
            .toStrictEqual( oldOcrEngineSettings.max_image_width );
    });

});