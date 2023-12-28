import { useEffect, useState } from "react";



export default function Debugging() {

    const [ image, setImage ] = useState<string>('');

    useEffect( () => {

        global.ipcRenderer.on( 'debugging:image', ( event: Electron.IpcRendererEvent, image: string ) => {            
        
            console.log({
                image,                
            });

            setImage( image );
        });

    }, [ global.ipcRenderer ] );

    return (
        <img src={`data:image/png;base64,${image}`} />
    )
}