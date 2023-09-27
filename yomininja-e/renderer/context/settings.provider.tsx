import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { SettingsPreset } from "../../electron-src/@core/domain/settings_preset/settings_preset";


export type SettingsContextType = {
    activeSettingsPreset: SettingsPreset;
    allSettingsPresets: SettingsPreset[];
};

export const SettingsContext = createContext( {} as SettingsContextType );


export const SettingsProvider = ( { children }: PropsWithChildren ) => {
    
    const [ activeSettingsPreset, setActiveSettingsPreset ] = useState< SettingsPreset | null >( null );
    const [ allSettingsPresets, setAllSettingsPresets ] = useState< SettingsPreset[] >( [] );

    function activeSettingsPresetHandler( event: Electron.IpcRendererEvent, data: SettingsPreset ) {

        console.log(data);
        // setActiveSettingsPreset(activeSettingsPreset);
    }
    
    useEffect( () => {

        global.ipcRenderer.on( 'settings_preset:active_data', activeSettingsPresetHandler );

        global.ipcRenderer.invoke( 'settings_preset:get_active' );

    }, [ global.ipcRenderer ] );    
    
    
    return (
        <SettingsContext.Provider
            value={{
                activeSettingsPreset,
                allSettingsPresets
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}