import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { CaptureSource } from '../../electron-src/ocr_recognition/common/types';

export type CaptureSourceContextType = {
    activeCaptureSource: CaptureSource;
    captureSources: CaptureSource[];
    captureSourceImage?: Buffer;
    updateActiveCaptureSource: ( update: CaptureSource ) => Promise< void >;
    refreshCaptureSources: () => void; 
};



export const CaptureSourceContext = createContext( {} as CaptureSourceContextType );


export const CaptureSourceProvider = ( { children }: PropsWithChildren ) => {
    
    const [ activeCaptureSource, setActiveCaptureSource ] = useState<CaptureSource>();
    const [ captureSources, setCaptureSources ] = useState< CaptureSource[] >();
    const [ captureSourceImage, setCaptureSourceImage ] = useState< Buffer | undefined >();


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

        global.ipcRenderer.on( 'app:capture_source_image', ( event, data: Buffer ) => {
            setCaptureSourceImage( data );
        });
        
        return () => {
            global.ipcRenderer.removeAllListeners( 'app:active_capture_source' );
            global.ipcRenderer.removeAllListeners( 'app:capture_source_image' );
        }
    }, [ global.ipcRenderer ] );

    
    return (
        <CaptureSourceContext.Provider
            value={{
                updateActiveCaptureSource,
                refreshCaptureSources,
                activeCaptureSource,
                captureSources,
                captureSourceImage,
            }}
        >            
            {children}
        </CaptureSourceContext.Provider>
    );
}