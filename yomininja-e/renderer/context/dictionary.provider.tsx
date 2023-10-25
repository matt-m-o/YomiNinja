import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { debounce } from "@mui/material";
import { DictionaryHeadword } from '../../electron-src/@core/domain/dictionary/dictionary_headword/dictionary_headword';

export type DictionaryContextType = {
    headwords: DictionaryHeadword[];    
    search: ( text: string ) => void;    
};


export const DictionaryContext = createContext( {} as DictionaryContextType );


export const DictionaryProvider = ( { children }: PropsWithChildren ) => {
        
    const [ headwords, setHeadwords ] = useState< DictionaryHeadword[] >( [] );

    const search = debounce( async ( text: string ) => {

        console.time("dict-search");
        const result = await global.ipcRenderer.invoke( 'dictionaries:search', text );
        console.timeEnd("dict-search");
        
        console.log({ result });

        setHeadwords( result );

    }, 500 );
    
    
    return (
        <DictionaryContext.Provider
            value={{
                headwords,
                search,
            }}
        >
            {children}
        </DictionaryContext.Provider>
    );
}