// Native
import { join } from 'path';
import { format } from 'url';

import { BrowserWindow, IpcMainInvokeEvent, Menu, MenuItem, app, dialog, ipcMain } from "electron";
import isDev from 'electron-is-dev';
import { PAGES_DIR } from '../util/directories.util';
import { WindowManager } from '../../gyp_modules/window_management/window_manager';
import { windowManager } from '../@core/infra/app_initialization';
import { getBrowserWindowHandle } from '../util/browserWindow.util';
import { overlayController } from '../overlay/overlay.index';
import { uIOhook } from 'uiohook-napi';

export class MainController {

    private mainWindow: BrowserWindow;
    private captureSourceWindow: BrowserWindow | null;    
    private mainWindowUrl: string;

    private activeTabId: string; // Temporary solution for reloading UI without loosing tab

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
                sandbox: true,
                nodeIntegration: false,
                contextIsolation: false,
                preload: join(__dirname, '../preload.js'),
            },
        });

        if ( !isDev )
            this.mainWindow.removeMenu();

        // this.mainWindow.on( 'close', () => {
        //     if ( this.captureSourceWindow )
        //         this.captureSourceWindow.close();

        //     app.quit();
        // });
        this.mainWindow.on( 'close', async ( event ) => {

            if (
                !this.mainWindow.isVisible() ||
                !this.mainWindow.isFocused()
            ) {
                this.mainWindow.destroy()
                uIOhook.stop();
                this.captureSourceWindow?.close();
                return;
            }

            event.preventDefault();

            const dialogButtons = ['Yes', 'No', 'Cancel'];

            const result = await dialog.showMessageBox(
                this.mainWindow,
                {
                    type: 'question',
                    buttons: dialogButtons,
                    defaultId: 1,
                    cancelId: 2,
                    title: `Minimize to Tray? - ${app.getName()}`,
                    message: `Minimize to Tray?`,
                    checkboxLabel: 'Hide Overlay',
                    checkboxChecked: false
                }
            );

            const hideOverlay = result.checkboxChecked;
            
            const button = dialogButtons[ result.response ];
                
            if ( button === 'Cancel' )
                return;

            if ( button === 'No' ) {
                this.mainWindow.destroy();
                uIOhook.stop();
                return app.quit();
            }

            this.mainWindow.hide();
            this.captureSourceWindow?.close();

            if ( hideOverlay )
                overlayController.minimizeOverlayWindowToTray();
        });

        this.mainWindow.on('closed', () => {
            app.quit();
        });

        this.mainWindow.on( 'show', () => {   
            if ( process.platform !== 'linux' ) {
                windowManager
                    .setForegroundWindow( 
                        getBrowserWindowHandle( this.mainWindow )
                    );
            }
        });

        if ( !isDev ) {
            const menu = new Menu();
            menu.append( new MenuItem({
                label: 'View',
                submenu: [
                    {
                        role: 'resetZoom',
                        label: 'Reset Zoom',
                        accelerator: 'CommandOrControl+0',
                    },
                    {
                        role: 'zoomIn',
                        label: 'Zoom In',
                        accelerator: 'CommandOrControl+=',
                    },
                    {
                        role: 'zoomOut',
                        label: 'Zoom Out',
                        accelerator: 'CommandOrControl+-',
                    }
                ]
            }));
            Menu.setApplicationMenu( menu );
        }
        


        return this.mainWindow;
    }

    private registersIpcHandlers() {

        ipcMain.handle( 'main:set_active_tab', ( event: IpcMainInvokeEvent, message: string ) => {
            this.activeTabId = message;
        });

        ipcMain.handle( 'main:get_active_tab', ( event: IpcMainInvokeEvent, message: string ) => {
            return this.activeTabId;
        });

        ipcMain.handle( 'main:show_capture_source_selection', ( event: IpcMainInvokeEvent, message: string ) => {
            this.createCaptureSourceSelectionWindow();
        });

        ipcMain.handle( 'main:close_capture_source_selection', ( event: IpcMainInvokeEvent, message: string ) => {
            this.captureSourceWindow?.close();
            this.captureSourceWindow = null;
        });

        
    }

    async loadMainPage(): Promise< void >  {
        this.mainWindowUrl = isDev ?
            'http://localhost:8000/' :
            format({
                pathname: join( PAGES_DIR, '/index.html'),
                protocol: 'file:',
                slashes: true,
            });

        await this.mainWindow.loadURL (this.mainWindowUrl );

        this.mainWindow.show();
    }

    refreshPage(): void {
        this.mainWindow.loadURL( this.mainWindowUrl );
        this.mainWindow.setTitle('YomiNinja');
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