// Native
import { join } from 'path';
import { format } from 'url';

import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from "electron";
import isDev from 'electron-is-dev';
import { PAGES_DIR } from '../util/directories';

export class MainController {

    private mainWindow: BrowserWindow;
    private captureSourceWindow: BrowserWindow | null;

    constructor() {}

    async init(): Promise<BrowserWindow> {

        this.registersIpcHandlers();

        return this.createMainWindow();
    }

    private createMainWindow(): BrowserWindow {
        this.mainWindow = new BrowserWindow({
            show: false,
            width: 1200,
            height: 700,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                preload: join(__dirname, '../preload.js'),
            },
        });

        this.mainWindow.on( 'close', () => {
            if ( this.captureSourceWindow )
                this.captureSourceWindow.close();
        });

        return this.mainWindow;
    }

    private registersIpcHandlers() {

        ipcMain.handle( 'main:show_capture_source_selection', ( event: IpcMainInvokeEvent, message: string ) => {
            this.createCaptureSourceSelectionWindow();
        });

        ipcMain.handle( 'main:close_capture_source_selection', ( event: IpcMainInvokeEvent, message: string ) => {
            this.captureSourceWindow?.close();
            this.captureSourceWindow = null;
        });
    }

    async loadMainPage(): Promise< void >  {
        const url = isDev
        ? 'http://localhost:8000/'
        : format({
            pathname: join( PAGES_DIR, '/index.html'),
            protocol: 'file:',
            slashes: true,
        });

        await this.mainWindow.loadURL(url);

        this.mainWindow.show();
    }

    private createCaptureSourceSelectionWindow() {

        if ( this.captureSourceWindow ) {
            this.captureSourceWindow.show();
            return;
        }

        this.captureSourceWindow = new BrowserWindow({
            width: 790,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                preload: join(__dirname, '../preload.js'),
            },
            title: 'Capture source selection - YomiNinja'
        });

        this.captureSourceWindow.on( 'close', () => {
            this.captureSourceWindow = null;
        });

        const url = isDev
        ? 'http://localhost:8000/capture-source-selection'
        : format({
            pathname: join( PAGES_DIR, '/capture-source-selection.html'),
            protocol: 'file:',
            slashes: true,
        });

        this.captureSourceWindow.loadURL(url);

        return this.captureSourceWindow;
    }
}