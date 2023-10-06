import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { CaptureSource } from '../../electron-src/ocr_recognition/common/types';

export type CaptureSourceContextType = {
    updateActiveCaptureSource: ( update: CaptureSource ) => Promise< void >;
    activeCaptureSource: CaptureSource;
    captureSources: CaptureSource[];
};



export const CaptureSourceContext = createContext( {} as CaptureSourceContextType );


export const CaptureSourceProvider = ( { children }: PropsWithChildren ) => {
    
    const [ activeCaptureSource, setActiveCaptureSource ] = useState<CaptureSource>();
    const [ captureSources, setCaptureSources ] = useState< CaptureSource[] >();


    async function updateActiveCaptureSource( captureSource: CaptureSource ) {

        console.log( captureSource );

        setActiveCaptureSource( captureSource );
        global.ipcRenderer.invoke( 'ocr_recognition:set_capture_source', captureSource );
    }

    async function getCaptureSources() {
        const result: CaptureSource[] = await global.ipcRenderer.invoke( 'ocr_recognition:get_capture_sources' );

        console.log( result );

        setCaptureSources( result );
    }

    async function getActiveCaptureSource( ) {
        const source = await global.ipcRenderer.invoke( 'ocr_recognition:get_active_capture_source' );
        console.log(source);
        setActiveCaptureSource(source);
    }
    
    useEffect( () => {

        getCaptureSources();
        getActiveCaptureSource();
        
    }, [ global.ipcRenderer ] );

    
    return (
        <CaptureSourceContext.Provider
            value={{
                updateActiveCaptureSource,
                activeCaptureSource,
                captureSources
            }}
        >            
            {children}
        </CaptureSourceContext.Provider>
    );
}