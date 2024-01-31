import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { debounce } from "@mui/material";
import { DictionaryHeadword } from '../../electron-src/@core/domain/dictionary/dictionary_headword/dictionary_headword';
import DictionaryPopup from "../components/Dictionary/DictionaryPopup";
import { DictionaryFormats, ImportDictionaryDto } from '../../electron-src/dictionaries/dictionaries.controller'
import { LanguageJson } from "../../electron-src/@core/domain/language/language";
import { DictionaryImportProgress } from "../../electron-src/dictionaries/common/dictionary_import_progress";
import { Dictionary } from "../../electron-src/@core/domain/dictionary/dictionary";
import { BrowserExtension } from "../../electron-src/extensions/browser_extension";



export type DictionaryContextType = {
    installedDictionaries: Dictionary[];
    installedExtensions: BrowserExtension[];
    headwords: DictionaryHeadword[];
    isScannerEnabled: boolean;
    search: ( text: string ) => void;
    toggleScanner: ( enable: boolean ) => void;
    importDictionary: ( input: ImportDictionaryDto ) => Promise<string>;
    deleteAllDictionaries: ( ) => Promise<void>;
    openExtensionOptions: ( input: BrowserExtension ) => Promise<void>
    importProgress: DictionaryImportProgress;
};

export type PopupPosition = {
    x: number;
    y: number;
}

export const DictionaryContext = createContext( {} as DictionaryContextType );


export const DictionaryProvider = ( { children }: PropsWithChildren ) => {
        
    const [ installedDictionaries, setInstalledDictionaries ] = useState< Dictionary[] >();
    const [ installedExtensions, setInstalledExtensions ] = useState< BrowserExtension[] >();
    const [ headwords, setHeadwords ] = useState< DictionaryHeadword[] >( [] );
    const [ enableScanner, setEnableScanner ] = useState< boolean >( false );
    const [ popupPosition, setPopupPosition ] = useState< PopupPosition >({ x: 0, y: 0  });
    const [ importProgress, setImportProgress ] = useState< DictionaryImportProgress >();
    const [ currentRange, setCurrentRange ] = useState< Range >();
    const [ rangeEndOffset, setRangeEndOffset ] = useState< number >();


    // let currentRange: Range;
    // let rangeEndOffset: number;

    const search = debounce( async ( text: string ) => {

        console.time("dict-search");
        const result: DictionaryHeadword[] = await global.ipcRenderer.invoke( 'dictionaries:search', text );
        console.timeEnd("dict-search");

        // console.log({ result });

        setHeadwords( result );

        const firstResult = result[0];
    
        if ( !firstResult )
            return;

            
        // setCurrentTextSelection( firstResult.term );
        // let found = selectText( firstResult.term, range );

        // console.log({ found, firstResult })        

    }, 100 );
    
    function toggleScanner( enable: boolean ) {
        setEnableScanner( enable );
    }

    function getTextNodes( node ) {
        
        let textNodes = [];
        
        if ( node.nodeType == Node.TEXT_NODE ) {
            textNodes.push(node);
        } else {

            const children = node.childNodes;

            for (var i = 0; i < children.length; i++) {
                textNodes = textNodes.concat( getTextNodes(children[i]) );
            }
        }
        
        return textNodes;
    }

    const textScannerListener = debounce( ( event: MouseEvent ) => {

        const targetElement = event.target as HTMLElement;
    
        if ( !targetElement.className.includes('extracted-text') ) return;
    
        const range = document.caretRangeFromPoint( event.clientX, event.clientY );
        
        if ( range ) {

            const { startContainer } = range;

            if ( startContainer instanceof Text == false )
                return;

            console.log({ startOffset: range.startOffset })

            // @ts-expect-error
            const searchString = startContainer.data.substr( range.startOffset, 5 );
            setCurrentRange( range );
            setRangeEndOffset( range.startOffset + 5 );

            // currentRange = range;
            // rangeEndOffset = range.startOffset + 5;
            
            search( searchString );
            
            popupPositionHandler({
                x: event.clientX,
                y: event.clientY,
            });
            
            // const found = selectText( range.startOffset+ 5, range );
            selectText( range.startOffset+ 5, range );


            setTimeout( () => {
                _selectText();
            }, 2000 )

        }
    }, 250 );



    const _selectText = () => {

        // console.log({ rangeEndOffset, currentRange })

        if ( rangeEndOffset != null && currentRange ) {
            selectText( rangeEndOffset, currentRange );
        }
    }

    function selectText( end: number, range: Range ): boolean {        

        const { startContainer } = range;

        if ( startContainer instanceof Text == false )
            return false;
                        
        // let start = startContainer.textContent.indexOf( text );
        const start = range.startOffset;

        const textNodes = getTextNodes( startContainer );        

        const textNode = textNodes[0];
        // const end = start + text.length;

        const found = start >= 0 && end <= textNode.length;

        if ( !found ) return false;

        // console.log({ found })

        // console.log({ start, end })

        range.setStart( textNode, start );
        range.setEnd( textNode, end );        

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange( range );

        return true;
    }

    

    

    
    function popupPositionHandler( position: PopupPosition ) {

        position.y -= 250;
            
        const adjustedX = (position.x / window.innerWidth) * 100;
        const adjustedY = (position.y / window.innerHeight) * 100;

        setPopupPosition({
            x: adjustedX,
            y: adjustedY
        });
        
    }

    function importProgressReportHandler( event, progressReport: DictionaryImportProgress ) {
        // console.log( progressReport );
        setImportProgress( progressReport );
        if ( progressReport.status === 'completed' )
            getDictionaries();
    }

    async function getDictionaries() {

        const dictionaries = await global.ipcRenderer.invoke( 'dictionaries:get_all_installed' );
        const extensions = await global.ipcRenderer.invoke( 'extensions:get_all_extensions' );

        // console.log({ extensions })

        setInstalledDictionaries( dictionaries );
        setInstalledExtensions( extensions );
    }

    async function deleteAllDictionaries() {
        await global.ipcRenderer.invoke( 'dictionaries:delete_all' );
        getDictionaries();
    }

    async function openExtensionOptions( browserExtension: BrowserExtension ): Promise< void > {
        await global.ipcRenderer.invoke( 'extensions:open_extension_options', browserExtension );
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
                left: popupPosition.x+'%',
                top: popupPosition.y+'%'
            }}
            // targetElement={}
        />
    )
    
    return (
        <DictionaryContext.Provider
            value={{
                installedDictionaries,
                installedExtensions,
                headwords,
                isScannerEnabled: enableScanner,
                search,
                toggleScanner,
                importDictionary,
                importProgress,
                deleteAllDictionaries,
                openExtensionOptions
            }}
        >
            { enableScanner &&
                popup
            }
            {children}
        </DictionaryContext.Provider>
    );
}