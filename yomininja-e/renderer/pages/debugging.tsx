import { useEffect, useState } from "react";
import { ipcRenderer } from "../utils/ipc-renderer";



export default function Debugging() {

    const [ image, setImage ] = useState<string>('');

    useEffect( () => {

        ipcRenderer.on( 'debugging:image', ( event: Electron.IpcRendererEvent, image: string ) => {            
        
            console.log({
                image,                
            });

            setImage( image );
        });

    }, [ ipcRenderer ] );

    return (
        <img src={`data:image/png;base64,${image}`} />
    )
}