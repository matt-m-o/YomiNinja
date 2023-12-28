import { BrowserWindow } from "electron";
import os from 'os';

export function getBrowserWindowHandle( window: BrowserWindow ) {

    // Sometimes the media source id handle is wrong on linux, requiring increasing the id number    
    let handle = Number( window.getMediaSourceId().split(':')[1] )


    // console.log({
    //     windowId: window.id,
    //     handle,
    // });

    return handle;
}