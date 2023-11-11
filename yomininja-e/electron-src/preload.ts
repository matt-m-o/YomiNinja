/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ipcRenderer, IpcRenderer } from 'electron';
import { injectBrowserAction } from 'electron-chrome-extensions/dist/browser-action';

declare global {
  namespace NodeJS {
    interface Global {
      ipcRenderer: IpcRenderer;
    }
  }
};

// Since we disabled nodeIntegration we can reintroduce
// needed node functionality here
process.once('loaded', () => {

  global.ipcRenderer = ipcRenderer;
  
});

// Inject <browser-action-list> element into our page
if ( 
  location.href.includes('index') || // Prod
  location.href === ('http://localhost:8000/') // Dev
) {
  injectBrowserAction();
}