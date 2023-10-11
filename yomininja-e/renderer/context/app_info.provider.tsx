import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrEngineSettings, OverlayBehavior, OverlayHotkeys, OverlayVisualCustomizations, SettingsPresetJson, SettingsPresetProps } from "../../electron-src/@core/domain/settings_preset/settings_preset";
import { Alert, Link, Snackbar, SxProps, Theme, debounce } from "@mui/material";
import { CheckForAppUpdates_Output } from '../../electron-src/@core/application/use_cases/check_for_app_updates/check_for_app_updates.use_case'


export type AppInfoContextType = {
    runUpdateCheck: () => Promise< CheckForAppUpdates_Output>;
    versionInfo: CheckForAppUpdates_Output;    
};

export const GithubReleasesLink = ( props?: { sx?: SxProps<Theme> } ) => (
    <Link sx={{...props?.sx}} href='#'        
        onClick={ () => global.ipcRenderer.invoke('app_info:open_releases_page') }
    >
        GitHub
    </Link>
);


export const AppInfoContext = createContext( {} as AppInfoContextType );


export const AppInfoProvider = ( { children }: PropsWithChildren ) => {
    
    const [ versionInfo, setVersionInfo ] = useState<CheckForAppUpdates_Output>();


    async function runUpdateCheck() {

        const result: CheckForAppUpdates_Output = await global.ipcRenderer.invoke( 'app_info:get_update_check' );

        // console.log( result );

        setVersionInfo( result );

        return result;
    }

    
    useEffect( () => {

        runUpdateCheck();
        
    }, [ global.ipcRenderer ] );

    const [ openSnackbar, setOpenSnackbar ] = useState(false);

    const newVersionNotification = (
        <Snackbar open={openSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            onClose={ () => setOpenSnackbar(false) }
            sx={{ minWidth: '300px' }}
        >
            <Alert severity="info" sx={{ width: '100%' }}
                onClose={ () => setOpenSnackbar(false) }
            >
                New version available on <GithubReleasesLink/>!
            </Alert>
        </Snackbar>
    );

    useEffect( () => {

        if ( !versionInfo?.isUpToDate )
            setOpenSnackbar(true);

    }, [versionInfo] )
    
    
    return (
        <AppInfoContext.Provider
            value={{
                runUpdateCheck,
                versionInfo,                
            }}
        >
            {newVersionNotification}
            {children}
        </AppInfoContext.Provider>
    );
}