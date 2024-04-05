import { screenCapturerService } from "./screen_capturer.index";

export class ScreenCapturerController {

    createCaptureStream() {
        screenCapturerService.createCaptureStream({});
    }

    onCapture( handler: ( frame: Buffer ) => Promise<void> ) {
        screenCapturerService.onCapture( handler );
    }

    destroyScreenCapturer() {
        screenCapturerService.destroyScreenCapturer();
    }
}