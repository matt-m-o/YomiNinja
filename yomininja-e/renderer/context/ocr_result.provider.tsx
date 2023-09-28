import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrResultScalable } from "../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";


export type OcrResultContextType = {    
    ocrResult: OcrResultScalable;
};

export const OcrResultContext = createContext( {} as OcrResultContextType );


export const OcrResultProvider = ( { children }: PropsWithChildren ) => {

    // const [ ocrResult, setOcrResult ] = useState< OcrResult >();
    const [ ocrResult, setOcrResult ] = useState< OcrResultScalable | null >( null );
  
  
    function ocrResultHandler ( _event, data: OcrResultScalable ) {
        // console.log( data );        
        setOcrResult(data);
    }
    
    useEffect( () => {

        global.ipcRenderer.on( 'ocr:result', ocrResultHandler );
        
        global.ipcRenderer.on( 'user_command:clear_overlay', () => {
            setOcrResult( null );
        });

        return () => {
            global.ipcRenderer.removeAllListeners( 'ocr:result' );
            global.ipcRenderer.removeAllListeners( 'user_command:clear_overlay' );
        }

    }, [ global.ipcRenderer ] );    
    
    
    return (
        <OcrResultContext.Provider
            value={{
                ocrResult,                
            }}
        >
            {children}
        </OcrResultContext.Provider>
    );
}