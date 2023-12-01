import { IpcMainInvokeEvent, clipboard, ipcMain, shell } from "electron";
import { SettingsPresetJson } from "./@core/domain/settings_preset/settings_preset";
import { settingsController } from "./settings/settings.index";
import { ocrRecognitionController } from "./ocr_recognition/ocr_recognition.index";
import { overlayController } from "./overlay/overlay.index";
import { mainController } from "./main/main.index";
import { uIOhook } from 'uiohook-napi'

// Handlers used by multiple controllers

ipcMain.handle( 'settings_preset:update', async ( event: IpcMainInvokeEvent, message: SettingsPresetJson ) => {

    if ( !message )
        return;    

    const { restartOcrAdapter } = await settingsController.updateSettingsPreset( message );

    uIOhook.removeAllListeners();
    
    overlayController.applySettingsPreset( message );
    ocrRecognitionController.applySettingsPreset( message );

    return {
        restartOcrAdapter
    };
});

ipcMain.handle( 'ocr_recognition:restart_engine', async ( event: IpcMainInvokeEvent, message: SettingsPresetJson ) => {

    ocrRecognitionController.restartEngine();
});

ipcMain.handle( 'refresh_all_windows', async () => {
    overlayController.refreshPage();
    mainController.refreshPage();
});

ipcMain.handle( 'open_link', async ( event: IpcMainInvokeEvent, message: string ) => {
    shell.openExternal(message);        
});