import { IpcMainInvokeEvent, screen } from "electron";
import { screenCapturerService } from "./screen_capturer.index";
import { CaptureSource } from "../app/types";
import { ipcMain } from "../common/ipc_main";
import isDev from "electron-is-dev";
import { isMacOS } from "../util/environment.util";

export class ScreenCapturerController {


    init() {
        ipcMain.handle('screen_capturer:set_interval', ( _, value: number ) => {
            console.log({
                newInterval: value
            });
            screenCapturerService.setIntervalBetweenFrames( value );
        });

        ipcMain.handle('screen_capturer:get_interval', ( ): number => {
            return screenCapturerService.intervalBetweenFrames;
        });

        ipcMain.handle('screen_capturer:get_display_size', ( ): any => {
            const display = screen.getPrimaryDisplay();
            return display.workAreaSize;
        });
    }

    screenshot( input: { captureSource: CaptureSource } ): boolean {
        
        const { captureSource } = input ; 
        
        if ( captureSource?.name?.includes('Entire screen') ) {
            const displays = screen.getAllDisplays();
            if ( displays.length > 1 )
                return false;
        }
    
        console.time("Screenshot time");
        screenCapturerService.grabFrame();
        return true;
    }

    createCapturer(
        input: {
            captureSource: CaptureSource,
            force?: boolean,
            streamFrames: boolean,
        }
    ) {
        screenCapturerService.createCapturer({
            captureSource: input.captureSource,
            force: Boolean(input.force),
            streamFrames: input.streamFrames,
            showWindow: isDev
        });
    }

    onStreamFrame( handler: ( frame: Buffer ) => Promise<void> ) {
        ipcMain.handle( 'screen_capturer:stream_frame', async ( event: IpcMainInvokeEvent, frame: Buffer ) => {

            if ( !frame )
                return;

            if ( isMacOS ) {
                frame = await screenCapturerService.cropWorkAreaFromImage({
                    image: frame
                });
            }

            handler( frame );
        });
    }

    onScreenshot( handler: ( screenshot: Buffer ) => Promise<void> ) {
        ipcMain.handle( 'screen_capturer:screenshot', async ( event: IpcMainInvokeEvent, screenshot: Buffer ) => {

            console.log()
            console.timeEnd("Screenshot time");
            console.log()

            if ( !screenshot )
                return;

            if ( isMacOS ) {
                screenshot = await screenCapturerService.cropWorkAreaFromImage({
                    image: screenshot
                });
            }

            handler( screenshot );
            
        });
    }

    async destroyScreenCapturer() {
        await screenCapturerService.destroyScreenCapturer();
    }

    async setCaptureSource( captureSource?: CaptureSource ) {

        if ( !captureSource )
            return;

        await screenCapturerService.setCaptureSource( captureSource );
    }

    async stopStream() {
        screenCapturerService.stopStream();
    }
}