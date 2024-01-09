import { BrowserWindow, IpcMainInvokeEvent, MouseInputEvent, clipboard, globalShortcut, ipcMain } from "electron";
import { OverlayService } from "./overlay.service";
import { join } from "path";
import isDev from 'electron-is-dev';
import { format } from "url";
import { PAGES_DIR } from "../util/directories.util";
import { WindowManager } from "../../gyp_modules/window_management/window_manager";
import { ClickThroughMode, SettingsPresetJson, ShowWindowOnCopy } from "../@core/domain/settings_preset/settings_preset";
import { uIOhook } from "uiohook-napi";
import { windowManager } from "../@core/infra/app_initialization";
import { getBrowserWindowHandle } from "../util/browserWindow.util";
import os from 'os';
import { matchUiohookMouseEventButton } from "../common/mouse_helpers";

export class OverlayController {

    private overlayService: OverlayService;
    private mainWindow: BrowserWindow;
    private overlayWindow: BrowserWindow;    

    private overlayAlwaysOnTop: boolean = true;
    private clickThroughMode: ClickThroughMode = 'auto';
    private copyTextOnClick: boolean = false;
    private showWindowOnCopy: ShowWindowOnCopy = {
        enabled: false,
        title: 'Yomichan'
    };
    private alwaysForwardMouseClicks: boolean = false;
    private showWindowWithoutFocus: boolean = false;
    private hideResultsOnBlur: boolean = false;

    private showResults: boolean = false;

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
            
        this.createOverlayWindow();
        this.registersIpcHandlers();
        // this.registerGlobalShortcuts();

        if ( settingsJson ) {
            await this.applySettingsPreset( settingsJson );
        }

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
            titleBarStyle: 'hidden',
            titleBarOverlay: false,
            title: 'OCR Overlay - YomiNinja'
        });

        this.overlayWindow.on( 'close', ( e ) => {
            e.preventDefault();
        });

        this.mainWindow?.on( 'closed', () => {
            this.overlayWindow.destroy();
        });

        this.overlayWindow.on( 'blur', () => {
            
            if ( !this.hideResultsOnBlur ) return;

            this.showResults = false;
            this.overlayWindow.webContents.send( 'user_command:toggle_results', false );
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
            this.clickThroughMode = 'disabled';
        }
        
        this.overlayWindow.setAlwaysOnTop( this.overlayAlwaysOnTop && !showDevTools, "normal" ); // normal, pop-up-menu och screen-saver

        // "True" Prevents black image when using youtube on some browsers (e.g. Brave)
        this.overlayWindow.setIgnoreMouseEvents( this.clickThroughMode !== 'disabled', { // !showDevTools
            forward: true, // !!showDevTools
        });

        // console.log({ clickThrough: this.clickThrough })
    }

    refreshPage(): void {
        this.overlayWindow.reload();
        this.overlayWindow.setTitle('OCR Overlay - YomiNinja');
    }

    private registersIpcHandlers() {

        ipcMain.handle( 'user_command:copy_to_clipboard', async ( event: IpcMainInvokeEvent, message: string ) => {

            try {

                if ( !message || message.length === 0 ) return;

                clipboard.writeText( message );
                this.overlayService.sendOcrTextTroughWS( message );
                // console.log({ text_to_copy: message });
                
                if ( 
                    !this.showWindowOnCopy.enabled ||
                    !this.showWindowOnCopy.title
                )
                    return;

                const windows = await windowManager.searchWindow(
                    this.showWindowOnCopy.title
                );
            
                if ( windows.length === 0 ) 
                    return;
            
                const windowToShow = windows[0];
                
                windowManager.setForegroundWindow( windowToShow.handle );

            } catch (error) {
                console.error( error );
            }
            
          
        });

        ipcMain.handle( 'overlay:set_ignore_mouse_events', ( event: IpcMainInvokeEvent, value: boolean ) => {

            // console.log(`overlay:set_ignore_mouse_events: ${value}`);

            // console.log('clickThroughMode: '+ this.clickThroughMode);

            if ( this.clickThroughMode === 'auto' ) {

                this.overlayWindow.setIgnoreMouseEvents(
                    value,
                    { forward: true }
                );
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


        if ( overlayHotkeys.toggle.includes('Mouse') ) {
            uIOhook.on( 'mousedown', e => {
    
                if ( !matchUiohookMouseEventButton( e, overlayHotkeys.toggle ) )
                    return;
    
                this.toggleOverlayHotkeyHandler();
            });
        }
        else if ( overlayHotkeys.toggle ) {
            // View overlay and copy text clipboard
            globalShortcut.register( overlayHotkeys.toggle, this.toggleOverlayHotkeyHandler );
            this.globalShortcutAccelerators.push( overlayHotkeys.toggle );
        }
        
        if ( overlayHotkeys.show.includes('Mouse') ) {
            uIOhook.on( 'mousedown', e => {
    
                if ( !matchUiohookMouseEventButton( e, overlayHotkeys.show ) )
                    return;
    
                this.showOverlayHotkeyHandler();
            });
        }
        else if ( overlayHotkeys.show ) {
            // View overlay and copy text clipboard
            globalShortcut.register( overlayHotkeys.show, this.showOverlayHotkeyHandler );
            this.globalShortcutAccelerators.push( overlayHotkeys.show );
        }

        if ( overlayHotkeys.clear.includes('Mouse') ) {
            uIOhook.on( 'mousedown', e => {
    
                if ( !matchUiohookMouseEventButton( e, overlayHotkeys.clear ) )
                    return;
    
                this.hideOverlayHotkeyHandler();
            });
        }
        else if ( overlayHotkeys.clear ) {
            // View overlay and clear
            globalShortcut.register( overlayHotkeys.clear, this.hideOverlayHotkeyHandler );
            this.globalShortcutAccelerators.push( overlayHotkeys.clear );
        }


        uIOhook.on( 'mousemove', async ( e ) => {

            if ( 
                this.clickThroughMode === 'disabled' ||
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

            if ( this.clickThroughMode !== 'enabled' ) return;

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
                this.clickThroughMode === 'disabled' ||
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

        this.overlayWindow?.webContents.send( 'user_command:toggle_results', true );
        
        const overlayWindowHandle = getBrowserWindowHandle( this.overlayWindow );
        
        console.log({ overlayWindowHandle });
        
        if ( !this.showWindowWithoutFocus ) {

            this.overlayWindow.setVisibleOnAllWorkspaces(
                true, { visibleOnFullScreen:true }
            );
            // if ( process.platform !== 'linux' ) {
            windowManager.setForegroundWindow( overlayWindowHandle );
            // }
        }

        this.overlayWindow.setAlwaysOnTop( false, "normal" );
        this.overlayWindow.setAlwaysOnTop( true, "screen-saver" ); // normal, pop-up-menu, och, screen-saver
        
        this.overlayWindow.setAlwaysOnTop( this.overlayAlwaysOnTop, "screen-saver" );
    }

    async applySettingsPreset( settingsPresetJson?: SettingsPresetJson ) {

        if ( !settingsPresetJson ) {
            settingsPresetJson = ( await this.overlayService.getActiveSettingsPreset() )
                ?.toJson();
        }

        if ( !settingsPresetJson ) return;

        this.overlayAlwaysOnTop = Boolean( settingsPresetJson.overlay.behavior.always_on_top );
        this.clickThroughMode = settingsPresetJson.overlay.behavior.click_through_mode;
        this.showWindowOnCopy = settingsPresetJson.overlay.behavior.show_window_on_copy;
        this.alwaysForwardMouseClicks = Boolean( settingsPresetJson.overlay.behavior.always_forward_mouse_clicks );
        this.showWindowWithoutFocus = Boolean( settingsPresetJson.overlay.behavior.show_window_without_focus );
        this.hideResultsOnBlur = Boolean( settingsPresetJson.overlay.behavior.hide_results_on_blur );

        this.overlayWindow?.setAlwaysOnTop( this.overlayAlwaysOnTop, "normal" );
        this.overlayWindow.setIgnoreMouseEvents( this.clickThroughMode !== 'disabled', {
            forward: true,
        });

        this.registerGlobalShortcuts( settingsPresetJson );

        this.overlayWindow?.webContents.send( 'settings_preset:active_data', settingsPresetJson );
    }

    private toggleOverlayHotkeyHandler = () => {        

        this.showResults = !this.showResults;
        this.overlayWindow.webContents.send( 'user_command:toggle_results', this.showResults );

        if ( this.showResults )
            this.showOverlayWindow();

        else if ( this.overlayWindow.isFocused() ) 
            this.overlayWindow.blur();
    }

    private showOverlayHotkeyHandler = () => {
        this.showOverlayWindow();
        // this.overlayWindow.webContents.send( 'user_command:copy_to_clipboard' );

        this.showResults = true;
        this.overlayWindow.webContents.send( 'user_command:toggle_results', this.showResults );
    }

    private hideOverlayHotkeyHandler = () => {
        // this.showOverlayWindow();
        this.showResults = false;
        this.overlayWindow.webContents.send( 'user_command:toggle_results', this.showResults );
        
        if ( this.overlayWindow.isFocused() )
            this.overlayWindow.blur();
    }
}