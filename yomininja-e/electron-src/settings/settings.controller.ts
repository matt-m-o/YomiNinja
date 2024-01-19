import { BrowserWindow, IpcMainInvokeEvent, dialog } from "electron";
import { SettingsService } from "./settings.service";
import { activeProfile } from "../@core/infra/app_initialization";
import { ipcMain } from 'electron';
import { SettingsPreset, SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import path from "path";
import fs from 'fs';



export class SettingsController {   
    
    private mainWindow: BrowserWindow;
    private settingsService: SettingsService;

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

        ipcMain.handle( 'settings_preset:load_cloud_vision_cred_file', async ( event: IpcMainInvokeEvent ) => {

            await this.loadCloudVisionCredentialsFile( activeProfile.id );

            return true;
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
            )
        }
    }
}
