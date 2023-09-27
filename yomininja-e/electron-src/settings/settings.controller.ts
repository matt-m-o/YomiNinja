import { BrowserWindow, IpcMainInvokeEvent } from "electron";
import { SettingsService } from "./settings.service";
import { activeProfile } from "../app_initialization";
import { ipcMain } from 'electron';
import { SettingsPreset } from "../@core/domain/settings_preset/settings_preset";


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

            const settingsPreset = await this.getActiveSettingsPreset( activeProfile.id );
            this.mainWindow.webContents.send( 'settings_preset:active_data', settingsPreset ); 
        });
    }
    
    
    private async getActiveSettingsPreset( profileId: string ): Promise< SettingsPreset | null > {
        return await this.settingsService.getActiveSettings({ profileId })
    }
}