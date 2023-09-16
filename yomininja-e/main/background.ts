import { app } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';

const isProd: boolean = process.env.NODE_ENV === 'production';

// Prevents from creating a new instance on every change
if ( app.requestSingleInstanceLock() ) {
  app.on('ready', createMainWindow);
}
else {
  app.quit();
}
  

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

async function createMainWindow() {
  (async () => {
    await app.whenReady();
  
    const mainWindow = createWindow('main', {
      width: 1000,
      height: 600,
    });
  
    if (isProd) {
      await mainWindow.loadURL('app://./home.html');
    } else {
      const port = process.argv[2];
      await mainWindow.loadURL(`http://localhost:${port}/home`);
      mainWindow.webContents.openDevTools();
    }
  })();
}

app.on('window-all-closed', () => {
  app.quit();
});
