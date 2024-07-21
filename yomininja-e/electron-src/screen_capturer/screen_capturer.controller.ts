import { ipcMain, IpcMainInvokeEvent, screen } from "electron";
import { screenCapturerService } from "./screen_capturer.index";
import { CaptureSource } from "../app/types";

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

    createCaptureStream( input: { captureSource: CaptureSource, force?: boolean } ) {
        screenCapturerService.createCaptureStream({
            captureSource: input.captureSource,
            force: Boolean(input.force)
        });
    }

    onCapture( handler: ( frame: Buffer ) => Promise<void> ) {
        ipcMain.handle( 'screen_capturer:frame', async ( event: IpcMainInvokeEvent, frame: Buffer ) => {

            if ( !frame )
                return;

            handler( frame );

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
}