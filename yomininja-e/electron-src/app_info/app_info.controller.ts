import { BrowserWindow, ipcMain, shell } from "electron";
import { AppInfoService } from "./app_info.service";
import { get_AppGithubUrl } from "../@core/infra/container_registry/adapters_registry";


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

        ipcMain.handle( 'app_info:open_releases_page', this.openAppReleasesPage );
        ipcMain.handle( 'app_info:open_patreon_page', this.openPatreonPage );
        ipcMain.handle( 'app_info:open_github_repo_page', this.openGithubRepoPage );
    }

    openAppReleasesPage() {
        shell.openExternal( get_AppGithubUrl() + '/releases' );        
    }    

    openGithubRepoPage() {
        shell.openExternal( get_AppGithubUrl() );
    }

    openPatreonPage() {
        shell.openExternal( 'https://www.patreon.com/YomiNinja' );
    }
}