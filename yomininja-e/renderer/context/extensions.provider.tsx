import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { BrowserExtension } from "../../electron-src/extensions/browser_extension";



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

    function handleActionButtonClick() {
        global.ipcRenderer.invoke( 'extensions:handle_action_button_click' );
    }

    
    useEffect( () => {
        getInstalledExtensions();
    }, [] );
    

    const browserActionList = ( <>
        {/* @ts-expect-error */}
        <browser-action-list onClick={ () => handleActionButtonClick() }></browser-action-list>
    </> )
    
    
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