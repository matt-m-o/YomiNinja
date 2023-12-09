import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { CaptureSource } from '../../electron-src/ocr_recognition/common/types';

export type CaptureSourceContextType = {
    updateActiveCaptureSource: ( update: CaptureSource ) => Promise< void >;
    activeCaptureSource: CaptureSource;
    captureSources: CaptureSource[];
    refreshCaptureSources: () => void; 
};



export const CaptureSourceContext = createContext( {} as CaptureSourceContextType );


export const CaptureSourceProvider = ( { children }: PropsWithChildren ) => {
    
    const [ activeCaptureSource, setActiveCaptureSource ] = useState<CaptureSource>();
    const [ captureSources, setCaptureSources ] = useState< CaptureSource[] >();


    async function updateActiveCaptureSource( captureSource: CaptureSource ) {

        // console.log( captureSource );

        setActiveCaptureSource( captureSource );
        global.ipcRenderer.invoke( 'app:set_capture_source', captureSource );
    }

    async function getCaptureSources() {
        const result: CaptureSource[] = await global.ipcRenderer.invoke( 'app:get_capture_sources' );

        console.log( result );

        setCaptureSources( result );
    }

    async function getActiveCaptureSource( ) {
        const source = await global.ipcRenderer.invoke( 'app:get_active_capture_source' );
        // console.log(source);
        setActiveCaptureSource(source);
    }

    async function refreshCaptureSources() {
        getCaptureSources();
    }
    
    useEffect( () => {

        getActiveCaptureSource();

        global.ipcRenderer.on( 'app:active_capture_source', ( event, data: CaptureSource ) => {
            setActiveCaptureSource( data );
        });
        
        return () => {
            global.ipcRenderer.removeAllListeners( 'app:active_capture_source' );            
        }
    }, [ global.ipcRenderer ] );

    
    return (
        <CaptureSourceContext.Provider
            value={{
                updateActiveCaptureSource,
                refreshCaptureSources,
                activeCaptureSource,
                captureSources,
            }}
        >            
            {children}
        </CaptureSourceContext.Provider>
    );
}