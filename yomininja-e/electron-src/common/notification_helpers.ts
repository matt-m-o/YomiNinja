import { BrowserWindow } from "electron";
import { InAppNotification } from "./types/in_app_notification";

export function pushInAppNotification(
    input: {
        notification: InAppNotification
        windows: BrowserWindow[]
    }
) {
    input.windows.forEach( window => {
        window.webContents.send(
            'notifications:show',
            input.notification
        );
    });
}