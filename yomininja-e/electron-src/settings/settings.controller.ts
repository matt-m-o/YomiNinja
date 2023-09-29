import { BrowserWindow, IpcMainInvokeEvent } from "electron";
import { SettingsService } from "./settings.service";
import { activeProfile } from "../app_initialization";
import { ipcMain } from 'electron';
import { SettingsPreset, SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";




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
        
    }
    
    
    private async getActiveSettingsPreset( profileId: string ): Promise<  SettingsPresetJson | null > {

        const settingsPreset = await this.settingsService.getActiveSettings({ profileId });

        if ( !settingsPreset )
            return null;        

        return settingsPreset.toJson();
    }

    async updateSettingsPreset( settingsPresetJson: SettingsPresetJson ) {

        await this.settingsService.updateSettingsPreset( settingsPresetJson );
    }
}
