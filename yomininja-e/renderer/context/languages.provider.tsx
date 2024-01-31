import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { LanguageJson } from "../../electron-src/@core/domain/language/language";


export type LanguagesContextType = {    
    languages: LanguageJson[]
};


export const LanguagesContext = createContext( {} as LanguagesContextType );


export const LanguagesProvider = ( { children }: PropsWithChildren ) => {
        
    const [ languages, setLanguages ] = useState< LanguageJson[] >();

    useEffect( () => {

        global.ipcRenderer.invoke( 'ocr_recognition:get_supported_languages' )
            .then( ( result: LanguageJson[] ) => {
                result.sort();
                setLanguages(result);
            });
        
    }, [ global.ipcRenderer ] );
    
    return (
        <LanguagesContext.Provider
            value={{
                languages
            }}
        >            
            {children}
        </LanguagesContext.Provider>
    );
}