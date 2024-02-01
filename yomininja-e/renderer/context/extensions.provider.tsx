import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { BrowserExtension } from "../../electron-src/extensions/browser_extension";
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Button, Divider } from "@mui/material";



export type ExtensionsContextType = {
    browserActionList: JSX.Element;
    installedExtensions: BrowserExtension[];
    installExtension: () => Promise<void>;
    uninstallExtension: ( extension: BrowserExtension ) => void;
    openExtensionOptions: ( input: BrowserExtension ) => Promise<void>
};

export const ExtensionsContext = createContext( {} as ExtensionsContextType );


export const ExtensionsProvider = ( { children }: PropsWithChildren ) => {
        
    const [ installedExtensions, setInstalledExtensions ] = useState< BrowserExtension[] >();
    

    async function getInstalledExtensions() {

        const extensions = await global.ipcRenderer.invoke( 'extensions:get_all_extensions' );

        // console.log({ extensions })
        setInstalledExtensions( extensions );
    }

    async function installExtension() {
        await global.ipcRenderer.invoke( 'extensions:install_extension' );
    }

    async function uninstallExtension( extension: BrowserExtension ) {
        await global.ipcRenderer.invoke( 'extensions:uninstall_extension', extension );
    }

    async function openExtensionOptions( browserExtension: BrowserExtension ): Promise< void > {
        await global.ipcRenderer.invoke( 'extensions:open_extension_options', browserExtension );
    }

    function refreshUI() {
        global.ipcRenderer.invoke( 'refresh_all_windows' );
    }

    function getExtensionActionButton( extensionId: string ): Element {
        const element = document.querySelector("browser-action-list")
            .shadowRoot
            .querySelector("#"+extensionId);

        return element;
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
                browserActionList,
            }}
        >
            {children}
        </ExtensionsContext.Provider>
    );
}