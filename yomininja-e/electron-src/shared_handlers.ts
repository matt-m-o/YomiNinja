import { IpcMainInvokeEvent, clipboard, ipcMain } from "electron";
import { SettingsPresetJson } from "./@core/domain/settings_preset/settings_preset";
import { settingsController } from "./settings/settings.index";
import { ocrRecognitionController } from "./ocr_recognition/ocr_recognition.index";

// Handlers used by multiple controllers

ipcMain.handle( 'settings_preset:update', async ( event: IpcMainInvokeEvent, message: SettingsPresetJson ) => {

    if ( !message )
        return;    

    const { restartOcrAdapter } = await settingsController.updateSettingsPreset( message );
    
    ocrRecognitionController.refreshActiveSettingsPreset( message );

    return {
        restartOcrAdapter
    };
});

ipcMain.handle( 'ocr_recognition:restart_engine', async ( event: IpcMainInvokeEvent, message: SettingsPresetJson ) => {

    ocrRecognitionController.restartEngine();
});

