// Packages
import os from 'os';
console.log({ cpu_model: os.cpus()[0].model.trim() });

import { BrowserWindow, app, ipcMain, IpcMainEvent, IpcMainInvokeEvent, clipboard, globalShortcut, systemPreferences } from 'electron';
import prepareNext from 'electron-next';
import './shared_handlers';
import { uIOhook } from 'uiohook-napi';
import { appController } from './app/app.index';
import { USER_DATA_DIR } from './util/directories.util';
import fs from 'fs';
import path from 'path';
const isMacOS = process.platform === 'darwin';


preInitialization();
// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
// app.disableHardwareAcceleration();

if (!gotTheLock)
  app.quit();

else {
  app.on('ready', async () => {

    if ( process.platform === 'win32' ) {
      app.setAppUserModelId(`com.yomininja.${app.getName()}`);
    }
  
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

function preInitialization() {

  const filePath = path.join(USER_DATA_DIR, 'launch_config.json');
  const fileExists = fs.existsSync(filePath);

  let fileData: string | undefined;
  
  if (fileExists) {
    fileData = fs.readFileSync(
      path.join(USER_DATA_DIR, 'launch_config.json'),
      'utf8'
    );
  }

  let launchConfig;

  if ( fileData )
    launchConfig = JSON.parse(fileData);

  console.log({ launchConfig });

  if ( !launchConfig ) {
    launchConfig = {
      hardware_acceleration: true
    };
    fs.writeFileSync(
      filePath,
      JSON.stringify( launchConfig, null, '\t' )
    );

    return;
  }

  if ( launchConfig.hardware_acceleration === false ) {
    app.disableHardwareAcceleration();
    console.log("Hardware Acceleration is disabled!");
  }
  
}