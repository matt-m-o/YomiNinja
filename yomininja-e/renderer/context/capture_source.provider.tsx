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


    async function updateActiveCaptureSource( update: CaptureSource ) {

        console.log( update );

        setActiveCaptureSource( update );
        // global.ipcRenderer.invoke( 'ocr_recognition:set_active_capture_source' );
    }

    async function getCaptureSources() {
        const result: CaptureSource[] = await global.ipcRenderer.invoke( 'ocr_recognition:get_capture_sources' );

        console.log( result );

        setCaptureSources( result );
    }

    
    useEffect( () => {

        getCaptureSources();
        
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