import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { SettingsPreset, SettingsPresetJson, SettingsPresetProps } from "../../electron-src/@core/domain/settings_preset/settings_preset";

export type SettingsContextType = {
    activeSettingsPreset: SettingsPresetJson;
    allSettingsPresets: SettingsPresetJson[];
    updateActivePreset: ( input: Partial<SettingsPresetJson> ) => void;
};

export interface SettingsPresetFront extends SettingsPresetProps {
    id: string;
}


export const SettingsContext = createContext( {} as SettingsContextType );


export const SettingsProvider = ( { children }: PropsWithChildren ) => {
    
    const [ activeSettingsPreset, setActiveSettingsPreset ] = useState< SettingsPresetJson | null >( null );
    const [ allSettingsPresets, setAllSettingsPresets ] = useState< SettingsPresetJson[] >( [] );

    function activeSettingsPresetHandler( event: Electron.IpcRendererEvent, data: SettingsPresetJson ) {
        
        console.log(data);
        setActiveSettingsPreset( data );
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
    
    useEffect( () => {

        global.ipcRenderer.on( 'settings_preset:active_data', activeSettingsPresetHandler );

        global.ipcRenderer.invoke( 'settings_preset:get_active' );

    }, [ global.ipcRenderer ] );
    
    
    return (
        <SettingsContext.Provider
            value={{
                activeSettingsPreset,
                allSettingsPresets,
                updateActivePreset
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}