import { IpcMainInvokeEvent, clipboard, shell } from "electron";
import { SettingsPresetJson } from "./@core/domain/settings_preset/settings_preset";
import { settingsController } from "./settings/settings.index";
import { ocrRecognitionController } from "./ocr_recognition/ocr_recognition.index";
import { overlayController } from "./overlay/overlay.index";
import { mainController } from "./main/main.index";
import { uIOhook } from 'uiohook-napi'
import { PpOcrAdapter } from "./@core/infra/ocr/ppocr.adapter/ppocr.adapter";
import { ipcMain } from "./common/ipc_main";

// Handlers used by multiple controllers

ipcMain.handle( 'ocr_recognition:restart_engine', async ( event: IpcMainInvokeEvent, engineName: string ) => {

    ocrRecognitionController.restartEngine( engineName );
});

ipcMain.handle( 'refresh_all_windows', async () => {
    overlayController.refreshPage();
    mainController.refreshPage();
});

ipcMain.handle( 'open_link', async ( event: IpcMainInvokeEvent, message: string ) => {
    shell.openExternal(message);        
});