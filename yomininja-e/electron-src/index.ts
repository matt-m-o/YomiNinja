// Packages
import { isUserDataCompatible, removeIncompatibleFiles, updateUserDataStructure, updateUserDataVersion } from './util/user_data.util';
updateUserDataStructure();
import os from 'os';
console.log({ cpu_model: os.cpus()[0].model.trim() });
import { httpServer } from './common/server';
import prepareNext from 'electron-next';
import './shared_handlers';
import { uIOhook } from 'uiohook-napi';
import { appController } from './app/app.index';
import { USER_DATA_DIR } from './util/directories.util';
import fs from 'fs';
import path from 'path';
import { getLaunchConfig } from './@core/infra/app_initialization';
import { pyOcrService } from './@core/infra/ocr/ocr_services/py_ocr_service/_temp_index';
import { paddleOcrService } from './@core/infra/ocr/ocr_services/paddle_ocr_service/_temp_index';
import { app, globalShortcut, Notification } from 'electron';
const isMacOS = process.platform === 'darwin';


preInitialization();
// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
// app.disableHardwareAcceleration();

if (!gotTheLock)
  app.quit();

else {
  app.on('ready', async () => {

    await postInstallSetup();

    if ( process.platform === 'win32' ) {
      app.setAppUserModelId(app.name);
    }
  
    // Prepare the renderer once the app is ready
    await prepareNext('./renderer');
  
    startUIOhook();
    await appController.init();
  });
  
  // Quit the app once all windows are closed
  app.on('window-all-closed', () => {

    pyOcrService.killServiceProcess();
    paddleOcrService.killServiceProcess();
  
    globalShortcut.unregisterAll();
  
    if ( process.platform !== 'darwin' ) {
      uIOhook.removeAllListeners();
      uIOhook.stop();
    }
    else {
      setTimeout( process.exit, 2000 );
    }
    
    app.quit();
  });
}



function startUIOhook(){

  if ( isMacOS ) return;

  uIOhook.start();
}

function preInitialization() {

  app.commandLine.appendSwitch( 'disable-features', 'WebSQL' );

  const launchConfig = getLaunchConfig();

  if ( launchConfig.hardware_acceleration === false ) {
    app.disableHardwareAcceleration();
    console.log("Hardware Acceleration is disabled!"); 
  }
  if ( launchConfig.gpu_compositing === false ) {
    app.commandLine.appendArgument(
      '--disable-gpu-compositing'
    );
    console.log("GPU Compositing is disabled!");
  }
  
}

async function postInstallSetup() {

  if ( isUserDataCompatible() )
      return;

  (new Notification({
      title: 'Initial setup in progress...',
      body: 'This may take a moment.'
  })).show();

  updateUserDataStructure();
  
  removeIncompatibleFiles();

  pyOcrService.installPython();

  updateUserDataVersion();
}