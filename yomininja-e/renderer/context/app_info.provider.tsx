import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { Alert, Link, Snackbar, SxProps, Theme, debounce } from "@mui/material";
import { CheckForAppUpdates_Output } from '../../electron-src/@core/application/use_cases/check_for_app_updates/check_for_app_updates.use_case'


export type AppInfoContextType = {
    versionInfo: CheckForAppUpdates_Output;
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

        if ( !versionInfo.isUpToDate )
            setOpenSnackbar(true);

        // console.log(versionInfo)

    }, [versionInfo] );

    function openGithubRepoPage(){
        global.ipcRenderer.invoke('app_info:open_github_repo_page');
    }

    function openPatreonPage(){
        global.ipcRenderer.invoke('app_info:open_patreon_page');
    }
    
    
    return (
        <AppInfoContext.Provider
            value={{
                versionInfo,
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