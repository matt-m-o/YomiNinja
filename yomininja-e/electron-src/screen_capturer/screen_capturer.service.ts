import { BrowserWindow, ipcMain, IpcMainInvokeEvent, MessagePortMain } from "electron";
import { ExternalWindow } from "../app/types";
import { join } from 'path';
import { PAGES_DIR } from "../util/directories.util";
import { format } from 'url';
import isDev from 'electron-is-dev';
import { ocrRecognitionController } from "../ocr_recognition/ocr_recognition.index";
import fs from 'fs';

export class ScreenCapturerService {

    screenCapturerWindow: BrowserWindow | undefined;
    captureHandler: ( frame: Buffer ) => void;
    intervalBetweenFrames: number = 333; // ms
    obs: any;
    obsConnected: boolean = false;

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

        // this.screenCapturerWindow.webContents.on( 'dom-ready', this.startStream );
        this.screenCapturerWindow.webContents.on( 'dom-ready', () => {
            this.setIntervalBetweenFrames( this.intervalBetweenFrames );
        });
    }

    async destroyScreenCapturer() {
        if ( !this.screenCapturerWindow ) 
            return;

        this.screenCapturerWindow.destroy();
        this.screenCapturerWindow = undefined;
    }

    setIntervalBetweenFrames( ms: number ) {
        this.intervalBetweenFrames = ms;
        this.screenCapturerWindow?.webContents.send(
            'screen_capturer:set_interval',
            this.intervalBetweenFrames
        );
    }

    grabFrame = () => {
        // console.log('\ngrabFrame \n')
        this.screenCapturerWindow?.webContents.send('screen_capturer:grab_frame');
    }

    startStream = async () => {
        while ( this.screenCapturerWindow !== undefined ) {
            await this.sleep( this.intervalBetweenFrames );
            this.grabFrame();
        }
    }

    sleep( ms: number ) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    connectObs = async ( password: string ) => {

        import('obs-websocket-js') // /msgpack
            .then( module => {

                const { default: OBSWebSocket  } = module;
                
                this.obs = new OBSWebSocket();
                
                this.obs.connect('ws://localhost:4455', password )
                    .then(( info: any ) => {
                        this.obsConnected = true;
                    }, () => {
                        console.error('Error Connecting')
                    });
            });
    }

    getOBSScreenshot = async ( sceneName: string ): Promise<Buffer> => {
        const data = await this.obs.call(
            'GetSourceScreenshot',
            {
                "sourceName": sceneName,
                "imageFormat": "png"
            }
        );

        const imageData = data.imageData.split('64,')[1];
        // fs.writeFileSync( './data/obs_screenshot.txt', imageData );

        return Buffer.from( imageData );
    }
}