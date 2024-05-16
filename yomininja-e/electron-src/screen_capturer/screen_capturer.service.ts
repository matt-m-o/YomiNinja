import { BrowserWindow, ipcMain, IpcMainInvokeEvent, MessagePortMain } from "electron";
import { CaptureSource, ExternalWindow } from "../app/types";
import { join } from 'path';
import { PAGES_DIR } from "../util/directories.util";
import { format } from 'url';
import isDev from 'electron-is-dev';
import { ocrRecognitionController } from "../ocr_recognition/ocr_recognition.index";
import fs from 'fs';
import { cloneDeep } from 'lodash';

export class ScreenCapturerService {

    captureSource: CaptureSource | undefined = undefined;
    screenCapturerWindow: BrowserWindow | undefined;

    captureHandler: ( frame: Buffer ) => void;
    intervalBetweenFrames: number = 333; // ms
    obs: any;
    obsConnected: boolean = false;

    async createCaptureStream( input: { captureSource: CaptureSource, force?: boolean }  ) {

        this.captureSource = cloneDeep( input.captureSource );

        await this.sleep(1000);

        if ( 
            !input.force &&
            this.screenCapturerWindow
        )
            return;

        await this.createCapturerWindow( false ); // isDev
    }

    async createCapturerWindow( showWindow = false ) {
        
        if ( this.screenCapturerWindow )
            await this.destroyScreenCapturer();
            
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
        
        if ( isDev ) {
            this.screenCapturerWindow.webContents.on(
                'dom-ready',
                this.screenCapturerWindow.webContents.openDevTools
            );
        }

        // this.screenCapturerWindow.webContents.on( 'dom-ready', this.startStream );
        this.screenCapturerWindow.webContents.on( 'dom-ready', () => {
            this.setIntervalBetweenFrames( this.intervalBetweenFrames );
        });
    }

    async destroyScreenCapturer() {
        if ( !this.screenCapturerWindow ) 
            return;

        this.screenCapturerWindow.webContents.send('screen_capturer:stop_stream');

        await this.sleep(1000);
        
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

    async setCaptureSource( captureSource: CaptureSource ) {

        if ( !this.screenCapturerWindow ) {
            this.captureSource = cloneDeep( captureSource );
            return;
        }

        const currentSize = this.captureSource?.window?.size;
        const newSize = captureSource.window?.size;

        const sameShape = (
            currentSize?.width === newSize?.width &&
            currentSize?.height === newSize?.height
        );

        if ( !sameShape ) {

            this.captureSource = cloneDeep( captureSource );

            await this.destroyScreenCapturer();
            await this.createCaptureStream({
                captureSource,
                force: true
            });
        }

    }

}