import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { CaptureSource } from '../../electron-src/ocr_recognition/common/types';

export type CaptureSourceContextType = {
    activeCaptureSource: CaptureSource;
    captureSources: CaptureSource[];
    captureSourceImage?: Buffer;
    captureSourceImageBase64?: string;
    updateActiveCaptureSource: ( update: CaptureSource ) => Promise< void >;
    refreshCaptureSources: () => void; 
    clearCaptureSourceImage: () => void;
};



export const CaptureSourceContext = createContext( {} as CaptureSourceContextType );


export const CaptureSourceProvider = ( { children }: PropsWithChildren ) => {
    
    const [ activeCaptureSource, setActiveCaptureSource ] = useState<CaptureSource>();
    const [ captureSources, setCaptureSources ] = useState< CaptureSource[] >();
    const [ captureSourceImage, setCaptureSourceImage ] = useState< Buffer | undefined >();
    const [ captureSourceImageBase64, setCaptureSourceImageBase64 ] = useState< string | undefined >();


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

    function clearCaptureSourceImage() {
        setCaptureSourceImage( undefined );
        setCaptureSourceImageBase64( undefined );
    }
    
    useEffect( () => {

        getActiveCaptureSource();

        global.ipcRenderer.on( 'app:active_capture_source', ( event, data: CaptureSource ) => {
            setActiveCaptureSource( data );
        });

        global.ipcRenderer.on( 'app:capture_source_image', ( event, data: { image: Buffer, imageBase64: string } ) => {
            setCaptureSourceImage( data.image );
            setCaptureSourceImageBase64( data.imageBase64 );
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
                clearCaptureSourceImage,
                activeCaptureSource,
                captureSources,
                captureSourceImage,
                captureSourceImageBase64
            }}
        >            
            {children}
        </CaptureSourceContext.Provider>
    );
}