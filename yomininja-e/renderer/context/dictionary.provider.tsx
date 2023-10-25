import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { debounce } from "@mui/material";
import { DictionaryHeadword } from '../../electron-src/@core/domain/dictionary/dictionary_headword/dictionary_headword';
import DictionaryPopup from "../components/Dictionary/DictionaryPopup";

export type DictionaryContextType = {
    headwords: DictionaryHeadword[];
    isScannerEnabled: boolean;
    search: ( text: string ) => void;
    toggleScanner: ( enable: boolean ) => void;
};

export type PopupPosition = {
    x: number;
    y: number;
}

export const DictionaryContext = createContext( {} as DictionaryContextType );


export const DictionaryProvider = ( { children }: PropsWithChildren ) => {
        
    const [ headwords, setHeadwords ] = useState< DictionaryHeadword[] >( [] );
    const [ isScannerEnabled, setIsScannerEnabled ] = useState< boolean >( true );
    const [ popupPosition, setPopupPosition ] = useState< PopupPosition >({ x: 0, y: 0  });

    const search = debounce( async ( text: string ) => {

        console.time("dict-search");
        const result: DictionaryHeadword[] = await global.ipcRenderer.invoke( 'dictionaries:search', text );
        console.timeEnd("dict-search");

        console.log({ result });

        setHeadwords( result );

    }, 250 );
    
    function toggleScanner( enable: boolean ) {
        setIsScannerEnabled( enable );
    }
    

    const textScannerListener = debounce( ( event: MouseEvent ) => {

        const targetElement = event.target as HTMLElement;
    
        if ( !targetElement.className.includes('extracted-text') ) return;
    
        const range = document.caretRangeFromPoint( event.clientX, event.clientY );        
                
        if ( range ) {

            const { endContainer, startOffset } = range;            

            if ( endContainer instanceof Text == false ) 
                return

            const substring = endContainer.data.substr(startOffset, 20);                    
    
            search( substring );

            popupPositionHandler({
                x: event.clientX,
                y: event.clientY,
            });
        }
    }, 250 );

    
    function popupPositionHandler( position: PopupPosition ) {

        position.y -= 250;

        setPopupPosition( position );
    }


    useEffect( () => {
        document.addEventListener( 'mousemove', textScannerListener );
    }, [] )

    useEffect( () => {

        console.log({ isScannerEnabled })

        if ( isScannerEnabled ) 
            document.addEventListener( 'mousemove', textScannerListener );
        
        else
            document.removeEventListener('mousemove', textScannerListener);        

        return () => {
            document.removeEventListener('mousemove', textScannerListener);
        };

    }, [ isScannerEnabled ] )

    const popup = (
        <DictionaryPopup    
            headwords={headwords}
            style={{
                left: popupPosition.x,
                top: popupPosition.y
            }}
            // targetElement={}
        >
        </DictionaryPopup>
    )
    
    return (
        <DictionaryContext.Provider
            value={{
                headwords,
                isScannerEnabled,
                search,
                toggleScanner
            }}
        >
            {popup}
            {children}
        </DictionaryContext.Provider>
    );
}