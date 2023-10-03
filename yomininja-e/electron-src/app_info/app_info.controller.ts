import { BrowserWindow, ipcMain } from "electron";
import { AppInfoService } from "./app_info.service";


export class AppInfoController {

    private appInfoService: AppInfoService;
    private mainWindow: BrowserWindow;

    constructor( input: {
        appInfoService: AppInfoService,
    }) {

        this.appInfoService = input.appInfoService;
    }

    init( mainWindow: BrowserWindow ) {

        this.mainWindow = mainWindow;

        ipcMain.handle( 'app_info:get_update_check', async () => {

            return this.appInfoService.checkForAppUpdates();
        });
    }
}