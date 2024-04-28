import { ipcMain, IpcMainInvokeEvent } from "electron";
import { screenCapturerService } from "./screen_capturer.index";

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
    }

    createCaptureStream( force = false ) {
        screenCapturerService.createCaptureStream({ force });
    }

    onCapture( handler: ( frame: Buffer ) => Promise<void> ) {
        ipcMain.handle( 'screen_capturer:frame', async ( event: IpcMainInvokeEvent, frame: Buffer ) => {

            if ( !frame )
                return;

            handler( frame );

        });
    }

    destroyScreenCapturer() {
        screenCapturerService.destroyScreenCapturer();
    }
}