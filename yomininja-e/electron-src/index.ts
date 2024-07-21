// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent, IpcMainInvokeEvent, clipboard, globalShortcut, systemPreferences } from 'electron';
import prepareNext from 'electron-next';
import './shared_handlers';
import { uIOhook } from 'uiohook-napi';
import { appController } from './app/app.index';
const isMacOS = process.platform === 'darwin';

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock)
  app.quit();
else {
  app.on('ready', async () => {
  
    // Prepare the renderer once the app is ready
    await prepareNext('./renderer');
  
    startUIOhook();
  
    await appController.init();
  });
  
  // Quit the app once all windows are closed
  app.on('window-all-closed', () => {
  
    globalShortcut.unregisterAll();
  
    if ( process.platform !== 'darwin' ) {
      uIOhook.removeAllListeners();
      uIOhook.stop();
    }
    
    app.quit();
  });
}



function startUIOhook(){
  if (
    isMacOS &&
    !systemPreferences.isTrustedAccessibilityClient(true)
  )
    return;

  uIOhook.start();
}