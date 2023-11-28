// Packages
import { initializeApp } from './@core/infra/app_initialization';
import { BrowserWindow, app, ipcMain, IpcMainEvent, IpcMainInvokeEvent, clipboard, globalShortcut } from 'electron';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';
import { PAGES_DIR } from './util/directories.util';
import { ocrRecognitionController } from './ocr_recognition/ocr_recognition.index';
import { settingsController } from './settings/settings.index';
import './shared_handlers';
import { uIOhook } from 'uiohook-napi';
import { appInfoController } from './app_info/app_info.index';
import { profileController } from './profile/profile.index';
import { overlayController } from './overlay/overlay.index';
import { mainController } from './main/main.index';
import { dictionariesController } from './dictionaries/dictionaries.index';

import { BrowserExtensionsService } from './extensions/browser_extensions.service';
import { createDebuggingWindow } from './util/debugging/debugging.util';

let browserExtensions: BrowserExtensionsService;

app.on('ready', async () => {
  
  // Prepare the renderer once the app is ready
  await prepareNext('./renderer');

  browserExtensions = new BrowserExtensionsService();
  await browserExtensions.init();

  const mainWindow = await mainController.init();

  if ( isDev )
    createDebuggingWindow();
  
  
  initializeApp()
    .then( async () => {
      
      const overlayWindow = await overlayController.init( mainWindow );
      browserExtensions.addBrowserWindow( overlayWindow );
      
      ocrRecognitionController.init({ mainWindow, overlayWindow });
      mainController.loadMainPage();
      settingsController.init( mainWindow );
      appInfoController.init( mainWindow );
      profileController.init( mainWindow );
      dictionariesController.init({ mainWindow, overlayWindow });

      browserExtensions.addBrowserWindow( mainWindow );
    });
});

// Quit the app once all windows are closed
app.on('window-all-closed', () => {

  globalShortcut.unregisterAll();
  uIOhook.removeAllListeners();
  uIOhook.stop();
  app.quit();
});