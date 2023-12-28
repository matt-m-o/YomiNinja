import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { DictionarySettings, OcrEngineSettings, OverlayBehavior, OverlayHotkeys, OverlayVisualCustomizations, SettingsPresetJson, SettingsPresetProps } from "../../electron-src/@core/domain/settings_preset/settings_preset";
import { debounce } from "@mui/material";

export type SettingsContextType = {
    activeSettingsPreset: SettingsPresetJson;
    allSettingsPresets: SettingsPresetJson[];
    updateActivePreset: ( input: Partial<SettingsPresetJson> ) => void;
    updateActivePresetHotkeys: ( newHotkeys: Partial<OverlayHotkeys> ) => void;
    updateActivePresetVisuals: ( input: Partial< OverlayVisualCustomizations > ) => void;
    updateActivePresetBehavior: ( input: Partial< OverlayBehavior > ) => void; 
    updateActivePresetOcrEngine: ( input: Partial< OcrEngineSettings > ) => void; 
    updateActivePresetDictionary: ( input: Partial< DictionarySettings > ) => void; 
};


export const SettingsContext = createContext( {} as SettingsContextType );


export const SettingsProvider = ( { children }: PropsWithChildren ) => {
    
    const [ activeSettingsPreset, setActiveSettingsPreset ] = useState< SettingsPresetJson | null >( null );
    const [ allSettingsPresets, setAllSettingsPresets ] = useState< SettingsPresetJson[] >( [] );

    const updateActivePresetIPC = debounce( async ( updatedPreset: SettingsPresetJson ) => {

        const { restartOcrAdapter } = await global.ipcRenderer.invoke( 'settings_preset:update', updatedPreset );

        // console.log({ restartOcrAdapter });

    }, 1500 );


    function updateActivePresetDictionary( input: Partial< DictionarySettings > ) {

        activeSettingsPreset.dictionary = {
            ...activeSettingsPreset?.dictionary,
            ...input,
        };
        
        updateActivePreset( activeSettingsPreset );
    }

    function updateActivePresetOcrEngine( newOcrEngine: Partial< OcrEngineSettings > ) {

        activeSettingsPreset.ocr_engine = {
            ...activeSettingsPreset?.ocr_engine,
            ...newOcrEngine,
        };
        
        updateActivePreset( activeSettingsPreset );
    }

    function updateActivePresetBehavior( newBehavior: Partial< OverlayBehavior > ) {

        activeSettingsPreset.overlay.behavior = {
            ...activeSettingsPreset.overlay.behavior,
            ...newBehavior,
        };

        
        if ( activeSettingsPreset.overlay.behavior.click_through_mode === 'disabled' )
            activeSettingsPreset.overlay.behavior.always_on_top = false;
        
        if ( 
            activeSettingsPreset.overlay.behavior.always_on_top &&
            activeSettingsPreset.overlay.behavior.click_through_mode === 'disabled'
        )
            activeSettingsPreset.overlay.behavior.click_through_mode = "auto";
    
        updateActivePreset( activeSettingsPreset );
    }

    function updateActivePresetHotkeys( newHotkeys: Partial< OverlayHotkeys > ) {

        activeSettingsPreset.overlay.hotkeys = {
            ...activeSettingsPreset.overlay.hotkeys,
            ...newHotkeys,
        };

        updateActivePreset( activeSettingsPreset );
    }

    function updateActivePresetVisuals( newVisuals: Partial< OverlayVisualCustomizations>  ) {

        activeSettingsPreset.overlay.visuals = {

            ...activeSettingsPreset.overlay.visuals,

            ocr_item_box: {                     
                ...activeSettingsPreset.overlay.visuals.ocr_item_box,
                ...newVisuals.ocr_item_box,                
            },

            frame: {
                ...activeSettingsPreset.overlay.visuals.frame,
                ...newVisuals.frame,
            }  
        };

        updateActivePreset( activeSettingsPreset );
    }
    
    function updateActivePreset( updatedPreset: Partial<SettingsPresetJson> ) {

        // console.log( updatedPreset );

        if ( !updatedPreset )
            return;
        
        setActiveSettingsPreset({
            ...activeSettingsPreset,
            ...updatedPreset,
        });
        
        // global.ipcRenderer.invoke( 'settings_preset:update', updatedPreset );
        updateActivePresetIPC( activeSettingsPreset );
    }

    function activeSettingsPresetHandler( data: SettingsPresetJson ) {
        
        // console.log(data);
        setActiveSettingsPreset( data );
    }

    
    useEffect( () => {

        global.ipcRenderer.on( 'settings_preset:active_data', ( event, data: SettingsPresetJson ) => {
            activeSettingsPresetHandler( data );
        });

        global.ipcRenderer.invoke( 'settings_preset:get_active' )
            .then( ( result: SettingsPresetJson ) => {
                activeSettingsPresetHandler(result);
            });

        return () => {
            global.ipcRenderer.removeAllListeners( 'settings_preset:active_data' );
        }
    }, [ global.ipcRenderer ] );
    
    
    return (
        <SettingsContext.Provider
            value={{
                activeSettingsPreset,
                allSettingsPresets,
                updateActivePreset,
                updateActivePresetHotkeys,
                updateActivePresetVisuals,
                updateActivePresetBehavior,
                updateActivePresetOcrEngine,
                updateActivePresetDictionary
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}