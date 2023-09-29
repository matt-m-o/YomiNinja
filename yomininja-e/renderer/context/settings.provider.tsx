import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OverlayHotkeys, OverlayVisualCustomizations, SettingsPresetJson, SettingsPresetProps } from "../../electron-src/@core/domain/settings_preset/settings_preset";

export type SettingsContextType = {
    activeSettingsPreset: SettingsPresetJson;
    allSettingsPresets: SettingsPresetJson[];
    updateActivePreset: ( input: Partial<SettingsPresetJson> ) => void;
    updateActivePresetHotkeys: ( newHotkeys: Partial<OverlayHotkeys> ) => void;
    updateActivePresetVisuals: ( newVisuals: Partial< OverlayVisualCustomizations > ) => void;
};

export interface SettingsPresetFront extends SettingsPresetProps {
    id: string;
}


export const SettingsContext = createContext( {} as SettingsContextType );


export const SettingsProvider = ( { children }: PropsWithChildren ) => {
    
    const [ activeSettingsPreset, setActiveSettingsPreset ] = useState< SettingsPresetJson | null >( null );
    const [ allSettingsPresets, setAllSettingsPresets ] = useState< SettingsPresetJson[] >( [] );

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

        console.log( updatedPreset );

        if ( !updatedPreset )
            return;

        setActiveSettingsPreset({
            ...activeSettingsPreset,
            ...updatedPreset,
        });

        global.ipcRenderer.invoke( 'settings_preset:update', updatedPreset );
    }

    function activeSettingsPresetHandler( event: Electron.IpcRendererEvent, data: SettingsPresetJson ) {
        
        console.log(data);
        setActiveSettingsPreset( data );
    }

    
    useEffect( () => {

        global.ipcRenderer.on( 'settings_preset:active_data', activeSettingsPresetHandler );

        global.ipcRenderer.invoke( 'settings_preset:get_active' );

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
                updateActivePresetVisuals
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}