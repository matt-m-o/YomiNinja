// Native
import { join } from 'path';
import { format } from 'url';

// Packages
import { initializeApp } from './app_initialization';
import { BrowserWindow, app, ipcMain, IpcMainEvent, IpcMainInvokeEvent, clipboard, globalShortcut } from 'electron';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';
import { PAGES_DIR } from './util/directories';
import { ocrRecognitionController } from './ocr_recognition/ocr_recognition.index';
import { settingsController } from './settings/settings.index';
import './shared_handlers';
import { uIOhook } from 'uiohook-napi';

initializeApp();


// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer');

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: join(__dirname, 'preload.js'),
    },
  });

  const url = isDev
    ? 'http://localhost:8000/'
    : format({
        pathname: join( PAGES_DIR, '/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(url);

  ocrRecognitionController.init();
  settingsController.init( mainWindow );
});

// Quit the app once all windows are closed
app.on('window-all-closed', () => {

  globalShortcut.unregisterAll();
  uIOhook.removeAllListeners();
  uIOhook.stop();
  app.quit();
});


ipcMain.handle( 'user_command:copy_to_clipboard', ( event: IpcMainInvokeEvent, message: string ) => {
  if (message)
      clipboard.writeText(message);
});
