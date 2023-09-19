import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrResult } from "../../electron-src/@core/domain/ocr_result/ocr_result";


export type OcrResultContextType = {
    ocrResult: OcrResult;    
};

export const OcrResultContext = createContext( {} as OcrResultContextType );



export const OcrResultProvider = ( { children }: PropsWithChildren ) => {

    const [ ocrResult, setOcrResult ] = useState< OcrResult >();  
  
  
    function ocrResultHandler ( _event, data: OcrResult ) {
        // console.log( data );
        setOcrResult( data );
    }
    
    useEffect( () => {
        global.ipcRenderer.on( 'ocr:result', ocrResultHandler );
    }, [global.ipcRenderer] );
    
    
    return (
      <OcrResultContext.Provider
        value={{
          ocrResult
        }}
      >
        {children}
      </OcrResultContext.Provider>
    );
  }