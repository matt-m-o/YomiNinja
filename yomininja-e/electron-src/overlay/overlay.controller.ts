import { BrowserWindow, IpcMainInvokeEvent, MouseInputEvent, clipboard, globalShortcut, ipcMain } from "electron";
import { OverlayService } from "./overlay.service";
import { join } from "path";
import isDev from 'electron-is-dev';
import { format } from "url";
import { PAGES_DIR } from "../util/directories.util";
import { WindowManager } from "../../gyp_modules/window_management/window_manager";
import { SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import { uIOhook } from "uiohook-napi";
import { windowManager } from "../@core/infra/app_initialization";
import { getBrowserWindowHandle } from "../util/browserWindow.util";
import os from 'os';

export class OverlayController {

    private overlayService: OverlayService;
    private mainWindow: BrowserWindow;
    private overlayWindow: BrowserWindow;    

    private overlayAlwaysOnTop: boolean = true;
    private clickThrough: boolean = true;
    private copyTextOnClick: boolean = false;
    private showYomichanWindowOnCopy: boolean = true;
    private alwaysForwardMouseClicks: boolean = false;

    private globalShortcutAccelerators: string[] = [];

    constructor( input: {
        overlayService: OverlayService
    }) {
        this.overlayService = input.overlayService;
    }

    async init( mainWindow: BrowserWindow ): Promise<BrowserWindow> {

        this.mainWindow = mainWindow;

        const settingsJson = (await this.overlayService.getActiveSettingsPreset())
            ?.toJson()

        if ( settingsJson ) {

            this.overlayAlwaysOnTop = Boolean( settingsJson.overlay.behavior.always_on_top );
            this.showYomichanWindowOnCopy = Boolean( settingsJson.overlay.behavior.show_yomichan_window_on_copy );
            this.clickThrough = Boolean( settingsJson.overlay.behavior.click_through );
            this.alwaysForwardMouseClicks = Boolean( settingsJson.overlay.behavior.always_forward_mouse_clicks );
        }

        this.createOverlayWindow();
        this.registersIpcHandlers();
        this.registerGlobalShortcuts();

        this.overlayWindow.on( 'show', ( ) => {
            this.showOverlayWindow();
        });        

        this.overlayService.initWebSocket();

        return this.overlayWindow;
    }

    private createOverlayWindow() {

        this.overlayWindow = new BrowserWindow({            
            fullscreen: true,
            frame: false,
            transparent: true,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: false, // false
                contextIsolation: false,
                preload: join(__dirname, '../preload.js'),                
            },
        });

        this.overlayWindow.on( 'close', ( e ) => {
            e.preventDefault();
        });

        this.mainWindow?.on( 'closed', () => {
            this.overlayWindow.destroy();
        });        

        const url = isDev
        ? 'http://localhost:8000/ocr-overlay'
        : format({
            pathname: join( PAGES_DIR, '/ocr-overlay.html' ),
            protocol: 'file:',
            slashes: true,
        });

        this.overlayWindow.loadURL(url);
        // this.overlayWindow.maximize();        
        
        const showDevTools = isDev && false;
        if (showDevTools) {
            this.overlayWindow.webContents.openDevTools();
            this.clickThrough = false;
        }
        
        this.overlayWindow.setAlwaysOnTop( this.overlayAlwaysOnTop && !showDevTools, "normal" ); // normal, pop-up-menu och screen-saver

        // "True" Prevents black image when using youtube on some browsers (e.g. Brave)
        this.overlayWindow.setIgnoreMouseEvents( this.clickThrough, { // !showDevTools
            forward: true, // !!showDevTools
        });

        // console.log({ clickThrough: this.clickThrough })
    }

    refreshPage(): void {
        this.overlayWindow.reload();
    }

    private registersIpcHandlers() {

        ipcMain.handle( 'user_command:copy_to_clipboard', async ( event: IpcMainInvokeEvent, message: string ) => {

            if ( !message || message.length === 0 ) return;            

            clipboard.writeText( message );
            this.overlayService.sendOcrTextTroughWS( message );
            // console.log({ text_to_copy: message });
            
            if ( !this.showYomichanWindowOnCopy )
                return;

            const windows = await windowManager.getAllWindows();
            const yomichanWindow = windows.find( window => window.title.includes( '- Yomichan Search' ) );
          
            if ( 
                !yomichanWindow            
            ) 
                return;
          
            windowManager.setForegroundWindow( yomichanWindow.handle );
          
        });

        ipcMain.handle( 'overlay:set_ignore_mouse_events', ( event: IpcMainInvokeEvent, value: boolean ) => {

            // console.log(`overlay:set_ignore_mouse_events: ${value}`);

            if ( this.clickThrough ) {                

                // this.overlayWindow.setIgnoreMouseEvents(
                //     value,
                //     { forward: true }
                // );
            }
        });
    }

    async registerGlobalShortcuts( settingsPresetJson?: SettingsPresetJson ) {        

        if ( !settingsPresetJson ) {            
            settingsPresetJson = (await this.overlayService.getActiveSettingsPreset())
                ?.toJson();
        }

        if ( !settingsPresetJson )
            return;

        const overlayHotkeys = settingsPresetJson.overlay.hotkeys;

        this.unregisterGlobalShortcuts();
        
        // View overlay and copy text clipboard
        globalShortcut.register( overlayHotkeys.show, () => {

            this.showOverlayWindow();
            // this.overlayWindow.webContents.send( 'user_command:copy_to_clipboard' );
        });
        this.globalShortcutAccelerators.push( overlayHotkeys.show );

        // View overlay and clear
        globalShortcut.register( overlayHotkeys.show_and_clear, () => {

            this.showOverlayWindow();
            this.overlayWindow.webContents.send( 'user_command:clear_overlay' );
        });
        this.globalShortcutAccelerators.push( overlayHotkeys.show_and_clear );


        uIOhook.on( 'mousemove', async ( e ) => {

            if ( 
                !this.clickThrough ||
                process.platform === 'win32'
            ) return;

            const { x, y } = this.getMousePosition(e);

            const mouseEvent: Electron.MouseInputEvent = {
                type: 'mouseMove',
                x,
                y,
                // globalX: e.x,
                // globalY: e.y,
            };
            this.overlayWindow.webContents.sendInputEvent(mouseEvent);
        });

        uIOhook.on( 'wheel', async ( e ) => {

            if ( !this.clickThrough ) return;

            const { x, y } = this.getMousePosition(e);

            const deltaY = -1 * e.rotation * 100;
            
            const mouseEvent: Electron.MouseWheelInputEvent = {
                type: 'mouseWheel',
                deltaY,
                x: x,
                y: y,
                // globalX: e.x,
                // globalY: e.y,
            };
            this.overlayWindow.webContents.sendInputEvent(mouseEvent);
        });

        uIOhook.on( 'click', async ( e ) => {

            if (
                !this.clickThrough ||
                !this.alwaysForwardMouseClicks
            ) return;

            const { x, y } = this.getMousePosition(e);

            const button = [ 'left', 'right', 'middle' ][ Number( e.button ) - 1 ] as MouseInputEvent['button'];

            this.overlayWindow.webContents.sendInputEvent({
                type: 'mouseDown',
                x,
                y,
                button,
                clickCount: 1
            });
            this.overlayWindow.webContents.sendInputEvent({
                type: 'mouseUp',
                x,
                y,
                button,
                clickCount: 1
            });
        });

    }

    private getMousePosition( absolutePosition: { x: number, y: number } ) {

        const [ xOffset, yOffset ] = this.overlayWindow.getPosition();
        let x = absolutePosition.x - xOffset;
        let y = absolutePosition.y - yOffset;

        x = x >= 0 ? x : 0;
        y = y >= 0 ? y : 0;

        return {
            x,
            y
        }
    }

    private unregisterGlobalShortcuts() {

        this.globalShortcutAccelerators.forEach( accelerator => {
            globalShortcut.unregister( accelerator );
        });

        this.globalShortcutAccelerators = [];
    }

    private showOverlayWindow() {
        // console.log("OverlayController.showOverlayWindow");

        const keepFocusOnCurrentWindow = true;
        
        const overlayWindowHandle = getBrowserWindowHandle( this.overlayWindow );
        
        console.log({ overlayWindowHandle });
        
        if ( !keepFocusOnCurrentWindow )
            windowManager.setForegroundWindow( overlayWindowHandle );

        this.overlayWindow.setAlwaysOnTop( false, "normal" );
        this.overlayWindow.setAlwaysOnTop( true, "normal" ); // normal, pop-up-menu och screen-saver
        
        this.overlayWindow.setAlwaysOnTop( this.overlayAlwaysOnTop, "normal" );
    }

    async applySettingsPreset( settingsPresetJson?: SettingsPresetJson ) {

        if ( !settingsPresetJson ) {
            settingsPresetJson = ( await this.overlayService.getActiveSettingsPreset() )
                ?.toJson();
        }

        if ( !settingsPresetJson ) return;

        this.overlayAlwaysOnTop = Boolean( settingsPresetJson.overlay.behavior.always_on_top );
        this.clickThrough = Boolean( settingsPresetJson.overlay.behavior.click_through );
        this.showYomichanWindowOnCopy = Boolean( settingsPresetJson.overlay.behavior.show_yomichan_window_on_copy );
        this.alwaysForwardMouseClicks = Boolean( settingsPresetJson.overlay.behavior.always_forward_mouse_clicks );
        
        this.overlayWindow?.setAlwaysOnTop( this.overlayAlwaysOnTop, "normal" );
        this.overlayWindow.setIgnoreMouseEvents( this.clickThrough, {
            forward: this.clickThrough,
        });

        this.registerGlobalShortcuts( settingsPresetJson );

        this.overlayWindow?.webContents.send( 'settings_preset:active_data', settingsPresetJson );
    }
}