import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrEngineSettings, OverlayBehavior, OverlayHotkeys, OverlayVisualCustomizations, SettingsPresetJson, SettingsPresetProps } from "../../electron-src/@core/domain/settings_preset/settings_preset";
import { debounce } from "@mui/material";
import { CheckForAppUpdates_Output } from '../../electron-src/@core/application/use_cases/check_for_app_updates/check_for_app_updates.use_case'


export type AppInfoContextType = {
    runUpdateCheck: () => Promise< CheckForAppUpdates_Output>;
    versionInfo: CheckForAppUpdates_Output;
};


export const AppInfoContext = createContext( {} as AppInfoContextType );


export const AppInfoProvider = ( { children }: PropsWithChildren ) => {
    
    const [ versionInfo, setVersionInfo ] = useState<CheckForAppUpdates_Output>();


    async function runUpdateCheck() {

        const result: CheckForAppUpdates_Output = await global.ipcRenderer.invoke( 'app_info:get_update_check' );

        console.log( result );

        setVersionInfo( result );

        return result;
    }

    
    useEffect( () => {

        runUpdateCheck();
        
    }, [ global.ipcRenderer ] );
    
    
    return (
        <AppInfoContext.Provider
            value={{
                runUpdateCheck,
                versionInfo
            }}
        >
            {children}
        </AppInfoContext.Provider>
    );
}