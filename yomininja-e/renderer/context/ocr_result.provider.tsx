import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrResultScalable } from "../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { ipcRenderer } from "../utils/ipc-renderer";
import { setTimeout } from "timers";
import { RecognizeSelection_IPC_Input } from "../../electron-src/ocr_recognition/ocr_recognition.controller";


export type OcrResultContextType = {    
    ocrResult: OcrResultScalable;
    showResults: boolean;
    processing: boolean;
    recognizeSelection: ( input: RecognizeSelection_IPC_Input ) => Promise<OcrResultScalable | null>;
};

export const OcrResultContext = createContext( {} as OcrResultContextType );


export const OcrResultProvider = ( { children }: PropsWithChildren ) => {

    // const [ ocrResult, setOcrResult ] = useState< OcrResult >();
    const [ ocrResult, setOcrResult ] = useState< OcrResultScalable | null >( null );
    const [ showResults, setShowResults ] = useState<boolean>( true );
    const [ processing, setProcessing ] = useState<boolean>(false);
    let previousResultId: string | undefined = '0';
  
    const ocrResultHandler = ( _event, data: OcrResultScalable ) => {

        if ( previousResultId == data?.id )
            return;

        setOcrResult(data);
        previousResultId = data?.id;
    }

    async function recognizeSelection( input: RecognizeSelection_IPC_Input ) {
        try {
            setProcessing(true);
            const result = await ipcRenderer.invoke(
                'ocr_recognition:recognize_selection',
                input
            );
            ocrResultHandler( null, result );
            setProcessing(false);
            return result;
        } catch (error) {
            console.error(error);
        }
        setProcessing(false);
    }
    
    useEffect( () => {

        ipcRenderer.on( 'ocr:result', ocrResultHandler );

        setTimeout( () => {
            ipcRenderer.invoke('ocr_recognition:get_result')
                .then( result => ocrResultHandler( null, result ) );
        }, 2000 );
        
        ipcRenderer.on( 'user_command:toggle_results', ( e, value ) => {
            // if ( showResults === value ) return;
            setShowResults( value );
        });

        ipcRenderer.on( 'ocr:processing_started', ( e, value ) => {
            // if ( processing === value ) return;
            setProcessing( true );
        });

        ipcRenderer.on( 'ocr:processing_complete', ( e, value ) => {
            // if ( processing === value ) return;
            setProcessing( false );
        });

        return () => {
            ipcRenderer.removeAllListeners( 'ocr:result' );
            ipcRenderer.removeAllListeners( 'ocr:processing_started' );
            ipcRenderer.removeAllListeners( 'ocr:processing_complete' );
            ipcRenderer.removeAllListeners( 'user_command:toggle_results' );
        }

    }, [ ipcRenderer ] );
    
    
    return (
        <OcrResultContext.Provider
            value={{
                ocrResult,
                showResults,
                processing,
                recognizeSelection
            }}
        >
            {children}
        </OcrResultContext.Provider>
    );
}