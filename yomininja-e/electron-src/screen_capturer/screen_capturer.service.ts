import { BrowserWindow, ipcMain, IpcMainInvokeEvent, MessagePortMain } from "electron";
import { ExternalWindow } from "../app/types";
import { join } from 'path';
import { PAGES_DIR } from "../util/directories.util";
import { format } from 'url';
import isDev from 'electron-is-dev';
import { ocrRecognitionController } from "../ocr_recognition/ocr_recognition.index";

export class ScreenCapturerService {

    screenCapturerWindow: BrowserWindow | undefined;
    captureHandler: ( frame: Buffer ) => void;

    async createCaptureStream( input: { display?: Electron.Display, window?: ExternalWindow, force?: boolean }  ) {

        const { display, window } = input;

        if ( 
            !input.force &&
            this.screenCapturerWindow
        )
            return;

        this.createCapturerWindow( false );
    }

    createCapturerWindow( showWindow = false ) {
        
        if ( this.screenCapturerWindow )
            this.destroyScreenCapturer();
            
        this.screenCapturerWindow = new BrowserWindow({
            width: 960,
            height: 540,
            autoHideMenuBar: true,
            show: showWindow,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                preload: join(__dirname, '../preload.js'),
            },
            title: 'Screen Capturer - YomiNinja'
        });

        const url = isDev
        ? 'http://localhost:8000/screen-capturer'
        : format({
            pathname: join( PAGES_DIR, '/screen-capturer.html'),
            protocol: 'file:',
            slashes: true,
        });

        this.screenCapturerWindow.loadURL(url);

        if ( showWindow ) {
            this.screenCapturerWindow.show();
        }
        
        this.screenCapturerWindow.webContents.on('dom-ready', this.screenCapturerWindow.webContents.openDevTools )
    }

    async destroyScreenCapturer() {
        if ( !this.screenCapturerWindow ) 
            return;

        this.screenCapturerWindow.destroy();
        this.screenCapturerWindow = undefined;
    }

    onCapture( handler: ( frame: Buffer ) => Promise<void> ) {

        ipcMain.handle( 'screen_capturer:frame', async ( event: IpcMainInvokeEvent, frame: Buffer ) => {

            if ( !frame )
                return;

            handler( frame );

        });
    }


}