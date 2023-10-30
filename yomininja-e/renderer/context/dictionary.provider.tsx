import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { debounce } from "@mui/material";
import { DictionaryHeadword } from '../../electron-src/@core/domain/dictionary/dictionary_headword/dictionary_headword';
import DictionaryPopup from "../components/Dictionary/DictionaryPopup";
import { DictionaryFormats, ImportDictionaryDto } from '../../electron-src/dictionaries/dictionaries.controller'
import { LanguageJson } from "../../electron-src/@core/domain/language/language";
import { DictionaryImportProgress } from "../../electron-src/dictionaries/common/dictionary_import_progress";
import { Dictionary } from "../../electron-src/@core/domain/dictionary/dictionary";



export type DictionaryContextType = {
    installedDictionaries: Dictionary[];
    headwords: DictionaryHeadword[];
    isScannerEnabled: boolean;
    search: ( text: string ) => void;
    toggleScanner: ( enable: boolean ) => void;
    importDictionary: ( input: ImportDictionaryDto ) => Promise<string>;
    deleteAllDictionaries: ( ) => Promise<void>;
    importProgress: DictionaryImportProgress;
};

export type PopupPosition = {
    x: number;
    y: number;
}

export const DictionaryContext = createContext( {} as DictionaryContextType );


export const DictionaryProvider = ( { children }: PropsWithChildren ) => {
        
    const [ installedDictionaries, setInstalledDictionaries ] = useState< Dictionary[] >();
    const [ headwords, setHeadwords ] = useState< DictionaryHeadword[] >( [] );
    const [ enableScanner, setEnableScanner ] = useState< boolean >( false );
    const [ popupPosition, setPopupPosition ] = useState< PopupPosition >({ x: 0, y: 0  });
    const [ importProgress, setImportProgress ] = useState< DictionaryImportProgress >();

    const search = debounce( async ( text: string ) => {

        console.time("dict-search");
        const result: DictionaryHeadword[] = await global.ipcRenderer.invoke( 'dictionaries:search', text );
        console.timeEnd("dict-search");

        console.log({ result });

        setHeadwords( result );

    }, 100 );
    
    function toggleScanner( enable: boolean ) {
        setEnableScanner( enable );
    }

    const textScannerListener = debounce( ( event: MouseEvent ) => {

        const targetElement = event.target as HTMLElement;
    
        if ( !targetElement.className.includes('extracted-text') ) return;
    
        const range = document.caretRangeFromPoint( event.clientX, event.clientY );        
                
        if ( range ) {

            const { endContainer, startOffset } = range;            

            if ( endContainer instanceof Text == false ) 
                return

            const substring = endContainer.data.substr(startOffset, 100);
    
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

    function importProgressReportHandler( event, progressReport: DictionaryImportProgress ) {
        console.log( progressReport );
        setImportProgress( progressReport );
        if ( progressReport.status === 'completed' )
            getDictionaries();
    }

    async function getDictionaries() {

        const dictionaries = await global.ipcRenderer.invoke( 'dictionaries:get_all_installed' );

        setInstalledDictionaries( dictionaries );
    }

    async function deleteAllDictionaries() {
        await global.ipcRenderer.invoke( 'dictionaries:delete_all' );
        getDictionaries();
    }

    
    useEffect( () => {

        getDictionaries();

        document.addEventListener( 'mousemove', textScannerListener );

        global.ipcRenderer.on( 'dictionaries:import_progress', importProgressReportHandler );
        
        return () => {
            document.removeEventListener( 'mousemove', textScannerListener );
            global.ipcRenderer.removeAllListeners( 'dictionaries:import_progress' );            
        }
    }, [] )

    useEffect( () => {

        console.log({ isScannerEnabled: enableScanner })

        if ( enableScanner ) 
            document.addEventListener( 'mousemove', textScannerListener );
        
        else
            document.removeEventListener('mousemove', textScannerListener);        

        return () => {
            document.removeEventListener('mousemove', textScannerListener);
        };

    }, [ enableScanner ] );


    async function importDictionary( input: ImportDictionaryDto ) {        

        const dto: ImportDictionaryDto = { ...input };
        const path: string = await global.ipcRenderer.invoke( 'dictionaries:import', dto );

        console.log({ path });

        return path;
    } 

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
                installedDictionaries,
                headwords,
                isScannerEnabled: enableScanner,
                search,
                toggleScanner,
                importDictionary,
                importProgress,
                deleteAllDictionaries,
            }}
        >
            { enableScanner &&
                popup
            }
            {children}
        </DictionaryContext.Provider>
    );
}