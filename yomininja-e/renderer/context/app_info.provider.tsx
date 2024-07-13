import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { Alert, Link, Snackbar, SxProps, Theme, debounce } from "@mui/material";
import { CheckForAppUpdates_Output } from '../../electron-src/@core/application/use_cases/check_for_app_updates/check_for_app_updates.use_case'
import { SystemInfo } from '../../electron-src/app_info/app_info.service';
import { ipcRenderer } from "../utils/ipc-renderer";


export type AppInfoContextType = {
    versionInfo: CheckForAppUpdates_Output;
    systemInfo: SystemInfo;
    runUpdateCheck: () => Promise< CheckForAppUpdates_Output>;
    openGithubRepoPage: () => void;
    openPatreonPage: () => void;
};

export const GithubReleasesLink = ( props?: { sx?: SxProps<Theme> } ) => (
    <Link href='#'
        sx={{
            ...props?.sx,
            position: 'relative',
            zIndex: 10
        }}
        onClick={ () => ipcRenderer.invoke('app_info:open_releases_page') }
    >
        GitHub
    </Link>
);



export const AppInfoContext = createContext( {} as AppInfoContextType );


export const AppInfoProvider = ( { children }: PropsWithChildren ) => {
    
    const [ versionInfo, setVersionInfo ] = useState<CheckForAppUpdates_Output>();
    const [ systemInfo, setSystemInfo ] = useState<SystemInfo>();


    async function runUpdateCheck() {

        const result: CheckForAppUpdates_Output = await ipcRenderer.invoke( 'app_info:get_update_check' );

        // console.log( result );

        setVersionInfo( result );

        return result;
    }

    async function getSystemInfo(): Promise< SystemInfo > {
        const systemInfo: SystemInfo = await ipcRenderer.invoke( 'app_info:get_system_info' );
        setSystemInfo(systemInfo);
        console.log({ systemInfo });
        return systemInfo;
    }

    
    useEffect( () => {

        runUpdateCheck();
        getSystemInfo();
        
    }, [ ipcRenderer ] );

    const [ openSnackbar, setOpenSnackbar ] = useState(false);

    const newVersionNotification = (
        <Snackbar open={openSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            onClose={ () => setOpenSnackbar(false) }
            sx={{ minWidth: '300px', alignItems: 'center' }}
        >
            <Alert severity="info" 
                sx={{
                    width: '100%',
                    alignItems: 'center',
                    fontSize: '1.2rem'
                }}
                onClose={ () => setOpenSnackbar(false) }                
            >
                New version available on <GithubReleasesLink/>!
            </Alert>
        </Snackbar>
    );

    useEffect( () => {

        if ( !versionInfo ) return;

        if ( !versionInfo?.isUpToDate )
            setOpenSnackbar(true);

        // console.log(versionInfo)

    }, [versionInfo] );

    function openGithubRepoPage(){
        ipcRenderer.invoke('app_info:open_github_repo_page');
    }

    function openPatreonPage(){
        ipcRenderer.invoke('app_info:open_patreon_page');
    }
    
    
    return (
        <AppInfoContext.Provider
            value={{
                versionInfo,
                systemInfo,
                runUpdateCheck,
                openPatreonPage,
                openGithubRepoPage
            }}
        >
            {newVersionNotification}
            {children}
        </AppInfoContext.Provider>
    );
}