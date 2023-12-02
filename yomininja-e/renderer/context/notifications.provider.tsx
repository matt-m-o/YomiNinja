import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { Alert, AlertColor, Button, Divider, Snackbar } from "@mui/material";
import { GithubReleasesLink } from "./app_info.provider";
import { InAppNotification } from '../../electron-src/common/types/in_app_notification'


export type NotificationsContextType = {
    notification: InAppNotification;
};

export const NotificationsContext = createContext( {} as NotificationsContextType );


export const NotificationsProvider = ( { children }: PropsWithChildren ) => {
        
    const [ notification, setNotification ] = useState< InAppNotification >();
    const [ openSnackbar, setOpenSnackbar ] = useState( false );
    // const [ alertContent, setAlertContent ] = useState< string | JSX.Element >( )

    
    
    useEffect( () => {
        global.ipcRenderer.on( 'notifications:show', ( event, data: InAppNotification ) => {
            setNotification( data );
            setOpenSnackbar( true );
        });
    
        return () => {
            global.ipcRenderer.removeAllListeners( 'notifications:show' );
        }
    }, [ global.ipcRenderer ] );
    
    
    return (
        <NotificationsContext.Provider
            value={{
                notification
            }}
        >
            <Snackbar open={ openSnackbar }
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                onClose={ () => setOpenSnackbar(false) }
                sx={{ minWidth: '300px', alignItems: 'center' }}
            >
                <Alert severity={ notification?.type }
                    sx={{
                        width: '100%',
                        alignItems: 'center',
                        fontSize: '1.2rem'
                    }}
                    onClose={ () => setOpenSnackbar(false) }                
                >
                    { notification?.message }
                </Alert>
            </Snackbar>
            {children}
        </NotificationsContext.Provider>
    );
}