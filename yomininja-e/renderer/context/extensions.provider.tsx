import { PropsWithChildren, createContext, useEffect, useState } from "react";
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Button, Divider } from "@mui/material";
import { BrowserExtensionJson } from "../../electron-src/@core/domain/browser_extension/browser_extension";
import { setTimeout } from "timers";
import { ipcRenderer } from "../utils/ipc-renderer";



export type ExtensionsContextType = {
    browserActionList: JSX.Element;
    installedExtensions: BrowserExtensionJson[];
    installExtension: () => Promise<void>;
    uninstallExtension: ( extension: BrowserExtensionJson ) => void;
    openExtensionOptions: ( input: BrowserExtensionJson ) => Promise< void >;
    toggleExtension: ( extension: BrowserExtensionJson ) => void;
};

export const ExtensionsContext = createContext( {} as ExtensionsContextType );


export const ExtensionsProvider = ( { children }: PropsWithChildren ) => {
        
    const [ installedExtensions, setInstalledExtensions ] = useState< BrowserExtensionJson[] >();
    

    async function getInstalledExtensions() {

        const extensions = await ipcRenderer.invoke( 'extensions:get_all_extensions' );

        // console.log({ extensions })
        setInstalledExtensions( extensions );
    }

    async function installExtension() {
        await ipcRenderer.invoke( 'extensions:install_extension' );
    }

    async function uninstallExtension( extension: BrowserExtensionJson ) {
        await ipcRenderer.invoke( 'extensions:uninstall_extension', extension );
    }

    async function openExtensionOptions( browserExtension: BrowserExtensionJson ): Promise< void > {
        await ipcRenderer.invoke( 'extensions:open_extension_options', browserExtension );
    }

    function refreshUI() {
        ipcRenderer.invoke( 'refresh_all_windows' );
    }

    function getExtensionActionButton( extensionId: string ): Element {
        const element = document.querySelector("browser-action-list")
            .shadowRoot
            .querySelector("#"+extensionId);

        return element;
    }

    async function toggleExtension( extension: BrowserExtensionJson ) {
        await ipcRenderer.invoke(
            'extensions:toggle_extension',
            extension
        );
        setTimeout( refreshUI, 750 );
    }

    
    useEffect( () => {
        getInstalledExtensions();
    }, [] );
    

    const browserActionList = ( <>
        {/* @ts-expect-error */}
        <browser-action-list></browser-action-list>
        <Divider orientation="vertical" variant="middle" flexItem sx={{ ml: 2 }}/>

        <Button variant="text" 
            sx={{ marginLeft: 1, minWidth:'1px' }}
            title='Refresh for potential extension fixes'
            onClick={ refreshUI }
        >
            <RefreshRoundedIcon style={{ width: '28px' }}/>
        </Button>
    </> )
    
    useEffect( () => {

        if ( !installedExtensions )
            return;

        const tenTen = installedExtensions.find( item => {
            
            if ( !item.name.includes('10ten') )
                return;

            return item;
        });

        if ( !tenTen ) return;

        getExtensionActionButton( tenTen.id )
            ?.addEventListener('click', refreshUI );

        return () => {
            document.removeEventListener( 'click', refreshUI );
        };

    }, [ installedExtensions ] );
    
    
    return (
        <ExtensionsContext.Provider
            value={{
                installedExtensions,
                installExtension,
                uninstallExtension,
                openExtensionOptions,
                toggleExtension,
                browserActionList,
            }}
        >
            {children}
        </ExtensionsContext.Provider>
    );
}