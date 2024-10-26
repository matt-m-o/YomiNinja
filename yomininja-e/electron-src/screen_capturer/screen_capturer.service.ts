import { BrowserWindow, IpcMainInvokeEvent, MessagePortMain, screen } from "electron";
import { CaptureSource, ExternalWindow } from "../app/types";
import { join } from 'path';
import { PAGES_DIR } from "../util/directories.util";
import { format } from 'url';
import isDev from 'electron-is-dev';
import { ocrRecognitionController } from "../ocr_recognition/ocr_recognition.index";
import fs from 'fs';
import { cloneDeep } from 'lodash';
import sharp from "sharp";
import { windowManager } from "../@core/infra/app_initialization";

export class ScreenCapturerService {

    captureSource: CaptureSource | undefined = undefined;
    screenCapturerWindow: BrowserWindow | undefined;

    captureHandler: ( frame: Buffer ) => void;
    intervalBetweenFrames: number = 333; // ms
    obs: any;
    obsConnected: boolean = false;

    async createCapturer(
        input: {
            captureSource: CaptureSource,
            showWindow?: boolean,
            streamFrames: boolean,
            force?: boolean,
        }
    ) {

        const { showWindow, streamFrames } = input;

        if ( input.captureSource.id !== this.captureSource?.id )
            input.force = true;

        if ( 
            !input.force &&
            this.screenCapturerWindow
        ){

            if ( input.streamFrames )
                this.startStream();
            else
                this.stopStream();

            return;
        }

        this.captureSource = cloneDeep( input.captureSource );

        await this.sleep(1000);
        
        if ( this.screenCapturerWindow )
            await this.destroyScreenCapturer();
            
        this.screenCapturerWindow = new BrowserWindow({
            width: 1100,
            height: 600,
            autoHideMenuBar: true,
            show: showWindow,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                preload: join(__dirname, '../preload.js'),
                backgroundThrottling: false
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

        if ( streamFrames ) {
            this.screenCapturerWindow.webContents.on('dom-ready', () => {
                setTimeout( this.startStream, 3000 );
            });
        }

        this.screenCapturerWindow.webContents.once("did-navigate", () => {
            console.log(`\nWebRTC process id: ${this.screenCapturerWindow?.webContents.getOSProcessId()}\n`);
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
        this.screenCapturerWindow?.webContents.send('screen_capturer:grab_frame');
    }

    startStream = async () => {

        this.screenCapturerWindow?.webContents.send('screen_capturer:start_stream');
        this.setIntervalBetweenFrames( this.intervalBetweenFrames );

        // while ( this.screenCapturerWindow !== undefined ) {
        //     await this.sleep( this.intervalBetweenFrames );
        //     this.grabFrame();
        // }
    }

    stopStream = () => {
        this.screenCapturerWindow?.webContents.send('screen_capturer:stop_stream');
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

    }

    async cropWorkAreaFromImage(
        input: {
            image: Buffer
        }
    ): Promise<Buffer> {

        const { image } = input;

        let display = screen.getAllDisplays()
            .find( display => display.id == Number(this.captureSource?.displayId) );

        console.log( this.captureSource );

        console.log({
            displays: screen.getAllDisplays().map( s => s.id )
        });

        // try with a display with negative coordinats

        display = display || (await this.getCurrentDisplay());

        const sharpPipeline = sharp(image);

        const imageMetadata = await sharpPipeline.metadata();

        if (
            !imageMetadata.width ||
            !imageMetadata.height ||
            !display
        )
            return image;

        console.log({
            imageMetadata: {
                width: imageMetadata.width,
                height: imageMetadata.height,
            },
            workArea: {
                width: display.workArea.width,
                height: display.workArea.height,
            }
        });

        if (
            imageMetadata.height > display.workArea.height ||
            imageMetadata.width > display.workArea.width
        ) {
            const { workArea } = display;

            const region: sharp.Region = {
                top: workArea.y,
                left: workArea.x,
                width: workArea.width,
                height: workArea.height
            };

            if ( region.top < 0 )
                region.top = 0;

            if ( region.left < 0 )
                region.left = 0;

            const overWidth = (region.width + region.left) - imageMetadata.width;
            const overHeight = (region.height + region.top) - imageMetadata.height;

            if ( overWidth > 0 )
                region.width = region.width - overWidth;

            if ( overHeight > 0 )
                region.height = region.height - overHeight;


            console.log({
                workAreaSharpRegion: region
            });

            const workAreaImage = sharpPipeline.extract(region);

            return await workAreaImage.toBuffer();
        }

        return image;
    }

    async getCurrentDisplay(): Promise<Electron.Display> {
        const cursorScreenPoint = await windowManager.getCursorPosition();
        const displayNearestPoint = screen.getDisplayNearestPoint(cursorScreenPoint);
        return displayNearestPoint;
    }

}