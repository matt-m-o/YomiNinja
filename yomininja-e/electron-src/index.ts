// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent, IpcMainInvokeEvent, clipboard, globalShortcut } from 'electron';
import prepareNext from 'electron-next';
import './shared_handlers';
import { uIOhook } from 'uiohook-napi';
import { appController } from './app/app.index';



app.on('ready', async () => {
  
  // Prepare the renderer once the app is ready
  await prepareNext('./renderer');

  await appController.init();
});

// Quit the app once all windows are closed
app.on('window-all-closed', () => {

  globalShortcut.unregisterAll();
  uIOhook.removeAllListeners();
  uIOhook.stop();
  app.quit();
});