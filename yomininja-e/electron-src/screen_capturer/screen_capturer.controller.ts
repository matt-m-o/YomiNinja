import { screenCapturerService } from "./screen_capturer.index";

export class ScreenCapturerController {

    createCaptureStream( force = false ) {
        screenCapturerService.createCaptureStream({ force });
    }

    onCapture( handler: ( frame: Buffer ) => Promise<void> ) {
        screenCapturerService.onCapture( handler );
    }

    destroyScreenCapturer() {
        screenCapturerService.destroyScreenCapturer();
    }
}