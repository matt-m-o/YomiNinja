import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import { join } from "path";
import { format } from "url";
import { PAGES_DIR } from "../directories.util";

let debuggingWindow: BrowserWindow | null;

export async function createDebuggingWindow() {

    if ( debuggingWindow ) return;
    
    debuggingWindow = new BrowserWindow({
        show: true,
        width: 1200,
        height: 700,            
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            preload: join( __dirname, '../../preload.js' ),
        },
    });

    debuggingWindow.on( 'close', () => {
        debuggingWindow = null;
    });

    const url = isDev
        ? 'http://localhost:8000/debugging'
        : format({
            pathname: join( PAGES_DIR, '/debugging.html'),
            protocol: 'file:',
            slashes: true,
        });


    await debuggingWindow.loadURL(url);
    debuggingWindow.show();
    debuggingWindow.webContents.openDevTools();
}

export async function displayImage( image: Buffer ) {

    if ( !isDev ) return;

    if ( !debuggingWindow )
        await createDebuggingWindow();

    if ( !debuggingWindow ) return;

    debuggingWindow.webContents.send( 'debugging:image', image.toString( 'base64' ) );
}