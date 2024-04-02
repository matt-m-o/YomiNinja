import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrResultScalable } from "../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";


export type OcrResultContextType = {    
    ocrResult: OcrResultScalable;
    showResults: boolean;
    processing: boolean;
};

export const OcrResultContext = createContext( {} as OcrResultContextType );


export const OcrResultProvider = ( { children }: PropsWithChildren ) => {

    // const [ ocrResult, setOcrResult ] = useState< OcrResult >();
    const [ ocrResult, setOcrResult ] = useState< OcrResultScalable | null >( null );
    const [ showResults, setShowResults ] = useState<boolean>( true );
    const [ processing, setProcessing ] = useState<boolean>(false);
  
    function ocrResultHandler ( _event, data: OcrResultScalable ) {
        // console.log( data );
        // console.log( ocrResult?.id === data?.id );

        if ( ocrResult?.id === data?.id )
            return;
        setOcrResult(data);
    }
    
    useEffect( () => {

        global.ipcRenderer.on( 'ocr:result', ocrResultHandler );
        
        global.ipcRenderer.on( 'user_command:toggle_results', ( e, value ) => {
            // if ( showResults === value ) return;
            // setShowResults( value );
        });

        global.ipcRenderer.on( 'ocr:processing_started', ( e, value ) => {
            // if ( processing === value ) return;
            // setProcessing( true );
        });

        global.ipcRenderer.on( 'ocr:processing_complete', ( e, value ) => {
            // if ( processing === value ) return;
            // setProcessing( false );
        });

        return () => {
            global.ipcRenderer.removeAllListeners( 'ocr:result' );
            global.ipcRenderer.removeAllListeners( 'ocr:processing_started' );
            global.ipcRenderer.removeAllListeners( 'ocr:processing_complete' );
            global.ipcRenderer.removeAllListeners( 'user_command:toggle_results' );
        }

    }, [ global.ipcRenderer ] );
    
    
    return (
        <OcrResultContext.Provider
            value={{
                ocrResult,
                showResults,
                processing
            }}
        >
            {children}
        </OcrResultContext.Provider>
    );
}