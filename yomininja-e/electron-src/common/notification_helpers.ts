import { BrowserWindow } from "electron";
import { InAppNotification } from "./types/in_app_notification";
import { ipcMain } from "./ipc_main";

export function pushInAppNotification(
    input: {
        notification: InAppNotification
        windows: BrowserWindow[]
    }
) {
    
    input.windows.forEach( window => {
        ipcMain.send(
            window,
            'notifications:show',
            input.notification
        );
    });
}