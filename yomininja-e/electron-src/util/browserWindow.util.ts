import { BrowserWindow } from "electron";
import os from 'os';

export function getBrowserWindowHandle( window: BrowserWindow ) {

    let handle = Number( window.getMediaSourceId().split(':')[1] )

    const platform = os.platform();

    if ( platform === 'linux' )
        handle++;

    console.log({
        windowId: window.id,
        handle,
    });

    return handle;
}