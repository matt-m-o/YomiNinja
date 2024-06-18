import { BrowserWindow, IpcMainInvokeEvent, dialog, session } from "electron";
import { SettingsService } from "./settings.service";
import { activeProfile } from "../@core/infra/app_initialization";
import { ipcMain } from 'electron';
import { SettingsPreset, SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import path from "path";
import fs from 'fs';
import { pushInAppNotification } from "../common/notification_helpers";
import { InAppNotification } from "../common/types/in_app_notification";
import { timingSafeEqual } from "crypto";
import { UnorderedBulkOperation } from "typeorm";



export class SettingsController {   
    
    private mainWindow: BrowserWindow;
    private settingsService: SettingsService;

    private cloudVisionWindow?: BrowserWindow;
    private googleWindow?: BrowserWindow;

    constructor( input: {
        settingsService: SettingsService,
        mainWindow?: BrowserWindow,
    }) {
        this.settingsService = input.settingsService;
    }

    init( mainWindow: BrowserWindow ) {

        this.mainWindow = mainWindow;

        ipcMain.handle( 'settings_preset:get_active', async ( event: IpcMainInvokeEvent, message: string ) => {

            const settingsPresetJson = await this.getActiveSettingsPreset( activeProfile.id );

            if ( !settingsPresetJson )
                return;
            
            this.mainWindow.webContents.send( 'settings_preset:active_data', settingsPresetJson ); 

            return settingsPresetJson;
        });

        ipcMain.handle( 'settings_preset:get_default', async ( event: IpcMainInvokeEvent ): Promise< SettingsPresetJson  > => {

            const settingsPresetJson = await this.settingsService.getDefaultSettings().toJson();

            return settingsPresetJson;
        });

        ipcMain.handle( 'settings_preset:load_cloud_vision_cred_file', async ( event: IpcMainInvokeEvent ) => {

            await this.loadCloudVisionCredentialsFile( activeProfile.id );

            return true;
        });

        ipcMain.handle( 'settings_preset:open_cloud_vision_page', async ( event: IpcMainInvokeEvent ) => {
            this.openCloudVisionTryItPage()
        });

        ipcMain.handle( 'settings_preset:open_google_page', async ( event: IpcMainInvokeEvent ) => {
            this.openGooglePage()
        });

        ipcMain.handle(
            'settings_preset:get_google_cookies',
            async ( event: IpcMainInvokeEvent ): Promise<Electron.Cookie[]> => {
                return this.settingsService.getGoogleCookies()
            }
        );

        ipcMain.handle(
            'settings_preset:remove_google_cookies',
            async ( event: IpcMainInvokeEvent ): Promise< void > => {
                return await this.settingsService.removeGoogleCookies();
            }
        );
        
        session.defaultSession.webRequest.onBeforeRequest( ( details, callback ) => {
            if ( details.url.includes( 'vision.googleapis' ) ) {

                const token = details.url.split('&token=')[1];

                if ( token ) {
                    this.settingsService.updateCloudVisionCredentials(
                        activeProfile.id,
                        { token }
                    );
                    this.cloudVisionWindow?.close();
                    this.notifyCredentialsLoaded();
                }
                else {
                    this.notifyFailedToLoadCredentials();
                }
            }
            callback({});
        });
    }
    
    
    private async getActiveSettingsPreset( profileId: string ): Promise<  SettingsPresetJson | null > {

        const settingsPreset = await this.settingsService.getActiveSettings({ profileId });

        if ( !settingsPreset )
            return null;        

        return settingsPreset.toJson();
    }

    async updateSettingsPreset( settingsPresetJson: SettingsPresetJson ) {

        return await this.settingsService.updateSettingsPreset( settingsPresetJson );
    }

    async loadCloudVisionCredentialsFile( profileId: string ) {

        const filters: Electron.FileFilter[] = [{
            name: 'JSON',
            extensions: [ 'json', 'JSON' ]
        }];

        const { filePaths } = await dialog.showOpenDialog(
            this.mainWindow,
            {
                properties: [ 'openFile' ],
                filters,
            }
        );
        
        if ( !filePaths[0] ) return;

        const fileContent = fs.readFileSync( filePaths[0], 'utf8' );

        const json = JSON.parse( fileContent );

        if (
            'client_email' in json &&
            'private_key' in json
        ) {
            
            await this.settingsService.updateCloudVisionCredentials(
                profileId,
                {
                    clientEmail: json.client_email,
                    privateKey: json.private_key
                }
            );
            this.notifyCredentialsLoaded();
        }
        else {
            console.error('Failed to load credentials!');
            this.notifyFailedToLoadCredentials();
        }
    }

    openCloudVisionTryItPage() {

        if ( this.cloudVisionWindow )
            return this.cloudVisionWindow.show();

        this.cloudVisionWindow = this.createWindow();
        this.cloudVisionWindow.on( 'closed', () => {
            this.cloudVisionWindow = undefined;
        });

        this.cloudVisionWindow.loadURL('https://cloud.google.com/vision/docs/drag-and-drop');
        this.cloudVisionWindow.show();

        this.cloudVisionWindow.webContents.executeJavaScript(`window.scrollTo(0, 520)`);
    }

    notifyCredentialsLoaded() {
        pushInAppNotification({
            notification: {
                type: 'info',
                message: 'Credentials loaded!',
            },
            windows: [
                this.mainWindow
            ]
        });
    }

    notifyFailedToLoadCredentials() {
        pushInAppNotification({
            notification: {
                type: 'error',
                message: 'Failed to load credentials!',
            },
            windows: [
                this.mainWindow
            ]
        });
    }

    openGooglePage() {

        if ( this.googleWindow )
            return this.googleWindow.show();

        this.googleWindow = this.createWindow();
        this.googleWindow.on( 'closed', async () => {
            
            this.googleWindow = undefined;
            
            this.mainWindow.webContents.send( 'settings_preset:google_window_closed' );
        });

        this.googleWindow.loadURL('https://www.google.com');
        this.googleWindow.show();
    }

    createWindow(): BrowserWindow {
        return new BrowserWindow({
            height: 720,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
            },
        });
    }
}
