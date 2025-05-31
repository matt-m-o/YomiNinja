import { BrowserWindow, IpcMainInvokeEvent, MouseInputEvent, clipboard, globalShortcut } from "electron";
import { OverlayService } from "./overlay.service";
import { join } from "path";
import isDev from 'electron-is-dev';
import { format } from "url";
import { PAGES_DIR } from "../util/directories.util";
import { SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import { uIOhook } from "uiohook-napi";
import { windowManager } from "../@core/infra/app_initialization";
import { getBrowserWindowHandle } from "../util/browserWindow.util";
import { matchUiohookMouseEventButton } from "../common/mouse_helpers";
import { ClickThroughMode, ShowWindowOnCopy } from "../@core/domain/settings_preset/settings_preset_overlay";
import { screen } from 'electron';
import { ipcMain } from "../common/ipc_main";
import { CaptureSource } from "../app/types";
import os from 'os';
import { ExternalWindow } from "../ocr_recognition/common/types";
import { WindowProperties } from "../../gyp_modules/window_management/window_manager";
import { httpServerPort, isWaylandDisplay, isWindows } from "../util/environment.util";
import { appService } from "../app/app.index";

const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

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

    private hoveredText: string = '';

    automaticOverlayBounds: boolean = true;

    isOverlayWindowInTray: boolean = false;

    isOverlayMovableResizable: boolean = false;

    activeCaptureSource?: CaptureSource;

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
            this.showOverlayWindow({ isElectronEvent: true });
        });

        this.overlayService.initWebSocket();
        this.applyTitleBarHideWorkaround();

        return this.overlayWindow;
    }

    private createOverlayWindow() {

        const useFullscreenMode = !isMacOS && !isLinux;

        let windowOptions: Electron.BrowserWindowConstructorOptions = {
            fullscreen: useFullscreenMode,
            frame: false,
            movable: true, //! false
            resizable: true,
            transparent: true,
            autoHideMenuBar: true,
            // skipTaskbar: isMacOS,
            // fullscreenable: true,
            // resizable: true,
            hasShadow: false,
            webPreferences: {
                nodeIntegration: false, // false
                contextIsolation: false,
                preload: join(__dirname, '../preload.js'),
                backgroundThrottling: false // potential fix for the black overlay issue
            },
            titleBarStyle: 'customButtonsOnHover',
            titleBarOverlay: false,
            title: 'OCR Overlay - YomiNinja'
        };

        if ( isMacOS ) {
            windowOptions = {
                ...windowOptions,
                skipTaskbar: true,
                fullscreenable: true,
                type: 'panel'
            }
        }

        this.overlayWindow = new BrowserWindow( windowOptions );

        if ( isMacOS )
            this.overlayWindow.setWindowButtonVisibility(false);

        this.overlayWindow.on( 'close', ( e ) => {
            e.preventDefault();
        });

        this.mainWindow?.on( 'closed', () => {
            this.overlayWindow.destroy();
        });

        this.overlayWindow.on( 'blur', () => {
            
            if ( !this.hideResultsOnBlur ) return;

            this.showResults = false;
            ipcMain.send( this.overlayWindow, 'user_command:toggle_results', false );
        });

        const url = isDev ?
            'http://localhost:8000/ocr-overlay':
            `http://localhost:${httpServerPort}/ocr-overlay.html`;

        this.overlayWindow.loadURL(url);
        // this.overlayWindow.maximize();
        
        const showDevTools = isDev && false;
        if (showDevTools) {
            this.overlayWindow.webContents.openDevTools();
            this.clickThroughMode = 'disabled';
        }
        
        this.overlayWindow.setAlwaysOnTop( this.overlayAlwaysOnTop && !showDevTools, "normal" ); // normal, pop-up-menu och screen-saver
        if ( !useFullscreenMode ) {
            this.overlayWindow.setBounds(
                screen.getPrimaryDisplay().bounds
            );
            this.overlayWindow.setVisibleOnAllWorkspaces(
                true,
                {
                    visibleOnFullScreen: true,
                    skipTransformProcessType: true
                }
            );
        }

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

        ipcMain.handle( 'overlay:set_hovered_text', async ( event: IpcMainInvokeEvent, message: string ) => {
            this.hoveredText = message;
        });

        ipcMain.handle( 'user_command:copy_to_clipboard', async ( event: IpcMainInvokeEvent, message: string ) => {
            this.copyText( message );
        });

        ipcMain.handle( 'overlay:set_ignore_mouse_events', ( event: IpcMainInvokeEvent, value: boolean ) => {

            // console.log(`overlay:set_ignore_mouse_events: ${value}`);

            // console.log('clickThroughMode: '+ this.clickThroughMode);

            if ( this.clickThroughMode === 'auto' ) {
                this.toggleClickThrough(value);
            }
        });

        ipcMain.handle( 'overlay:hide_browser_window', ( event: IpcMainInvokeEvent, data ) => {
            this.hideBrowserPopupOverlayWindow();
        });

        ipcMain.handle( 'overlay:hide_window', ( event: IpcMainInvokeEvent, data ) => {
            this.hideOverlayHotkeyHandler();
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


        if ( overlayHotkeys.toggle?.includes('Mouse') ) {
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
        
        if ( overlayHotkeys.show?.includes('Mouse') ) {
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

        if ( overlayHotkeys.clear?.includes('Mouse') ) {
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

        if ( overlayHotkeys.copy_text?.includes('Mouse') ) {
            uIOhook.on( 'mousedown', e => {
    
                if ( !matchUiohookMouseEventButton( e, overlayHotkeys.copy_text ) )
                    return;
    
                this.copyHoveredText();
            });
        }
        else if ( overlayHotkeys.copy_text ) {
            // View overlay and clear
            globalShortcut.register( overlayHotkeys.copy_text, this.copyHoveredText );
            this.globalShortcutAccelerators.push( overlayHotkeys.copy_text );
        }

        if ( overlayHotkeys.manual_adjustment?.includes('Mouse') ) {
            uIOhook.on( 'mousedown', e => {
    
                if ( !matchUiohookMouseEventButton( e, overlayHotkeys.manual_adjustment ) )
                    return;
    
                this.toggleMovable();
            });
        }
        else if ( overlayHotkeys.manual_adjustment ) {
            // View overlay and clear
            globalShortcut.register( overlayHotkeys.manual_adjustment, this.toggleMovable );
            this.globalShortcutAccelerators.push( overlayHotkeys.manual_adjustment );
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

    async remoteControlRouter( command: string ): Promise< boolean > {

        if ( command === 'toggle-overlay' ) {
            this.toggleOverlayHotkeyHandler();
            return true;
        }
        else if ( command === 'show-overlay' ) {
            this.showOverlayHotkeyHandler()
            return true;
        }
        else if ( command === 'hide-overlay' ) {
            this.hideOverlayHotkeyHandler();
            return true;
        }
        else if ( command === 'copy-text' ) {
            this.copyHoveredText();
            return true;
        }
        else if ( command === 'toggle-movable-overlay' ) {
            this.toggleMovable();
            return true;
        }

        return false;
    }

    private async showBrowserPopupOverlayWindow(): Promise<boolean> {
        const window = await this.getBrowserPopupWindow();

        if ( !window ) return false;

        windowManager.setForegroundWindow( window.handle );

        return true;
    }

    private async hideBrowserPopupOverlayWindow(): Promise< void > {

        if ( !this.activeCaptureSource?.window?.id ) return;

        const window = await this.getBrowserPopupWindow();

        if ( !window ) return;

        windowManager.setForegroundWindow( this.activeCaptureSource.window.id );
        
    }

    showOverlayWindow = (
        options?: {
            isElectronEvent: boolean;
            showInactive?: boolean;
            forceActivation?: boolean;
            displayResults?: boolean;
        }
    ) => {
        // console.log("OverlayController.showOverlayWindow");

        this.showBrowserPopupOverlayWindow()
            .then( success => {

                if (success) return;
                
                const overlayWindowHandle = getBrowserWindowHandle( this.overlayWindow );

                if ( !options?.isElectronEvent ) {

                    if ( options ) {
                        if ( typeof options?.displayResults === 'undefined' ) {
                            options = {
                                ...options,
                                displayResults: true
                            };
                        }
                    }

                    if ( isMacOS && this.overlayWindow.isFocused() )
                        this.overlayWindow.blur();

                    if ( this.showWindowWithoutFocus || options?.showInactive )
                        this.overlayWindow.showInactive();
                    else {
                        if ( isMacOS )
                            this.overlayWindow.showInactive();
                        else
                            this.overlayWindow.show();

                        if ( options?.forceActivation )
                            windowManager.setForegroundWindow( overlayWindowHandle );
                        else if ( isMacOS && this.activeCaptureSource?.type === "window" )
                            this.overlayWindow.moveAbove( this.activeCaptureSource.id );
                    }

                    ipcMain.send(
                        this.overlayWindow,
                        'user_command:toggle_results',
                        typeof options?.displayResults !== 'undefined' ? options.displayResults : true
                    );

                    return;
                }

                if ( this.isOverlayWindowInTray ) {
                    this.isOverlayWindowInTray = false
                    this.overlayWindow.showInactive();
                    return;
                }
                
                // console.log({ overlayWindowHandle });
                
                if ( !this.showWindowWithoutFocus ) {

                    this.overlayWindow.setVisibleOnAllWorkspaces(
                        true,
                        {
                            visibleOnFullScreen: true,
                            skipTransformProcessType: true
                        }
                    );
                    
                    if ( !isMacOS || options?.forceActivation ) {
                        windowManager.setForegroundWindow( overlayWindowHandle );
                    }
                }

                const level = isMacOS ? 'pop-up-menu' : 'screen-saver';

                this.overlayWindow.setAlwaysOnTop( false, "normal" );
                this.overlayWindow.setAlwaysOnTop( true, level ); // normal, pop-up-menu, och, screen-saver


                if ( isWaylandDisplay )
                    this.toggleClickThrough( false );

                if ( this.overlayAlwaysOnTop ) return;

                this.overlayWindow.setAlwaysOnTop( false, level );

            });   
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

        if ( typeof settingsPresetJson.overlay.behavior.automatic_adjustment !== 'undefined' )
            this.automaticOverlayBounds = Boolean( settingsPresetJson.overlay.behavior.automatic_adjustment );

        this.overlayWindow?.setAlwaysOnTop( this.overlayAlwaysOnTop, "normal" );
        this.overlayWindow.setIgnoreMouseEvents( this.clickThroughMode !== 'disabled', {
            forward: true,
        });

        this.registerGlobalShortcuts( settingsPresetJson );

        ipcMain.send( this.overlayWindow, 'settings_preset:active_data', settingsPresetJson );
    }

    private toggleOverlayHotkeyHandler = () => {        

        this.showResults = !this.showResults;
        ipcMain.send( this.overlayWindow, 'user_command:toggle_results', this.showResults );

        if ( this.showResults )
            this.showOverlayWindow();

        else if ( this.overlayWindow.isFocused() )
            this.overlayWindow.blur();

        this.hideBrowserPopupOverlayWindow();
    }

    private showOverlayHotkeyHandler = () => {

        if ( isWaylandDisplay ) {
            ipcMain.send( this.overlayWindow, 'user_command:toggle_results', false );
        }

        this.showOverlayWindow();

        this.showResults = true;
        ipcMain.send( this.overlayWindow, 'user_command:toggle_results', this.showResults );
    }

    private hideOverlayHotkeyHandler = () => {
        // this.showOverlayWindow();
        this.showResults = false;
        ipcMain.send( this.overlayWindow, 'user_command:toggle_results', this.showResults );
        
        if ( this.overlayWindow.isFocused() )
            this.overlayWindow.blur();

        this.hideBrowserPopupOverlayWindow();
    }

    private async copyText( text: string ) {
        try {

            if ( !text || text.length === 0 ) return;

            clipboard.writeText( text );
            this.overlayService.sendOcrTextTroughWS( text );
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
    }

    private copyHoveredText = () => {
        this.copyText( this.hoveredText );
    }

    toggleMovable = ( newMovableState?: boolean ): boolean => {

        if ( newMovableState === undefined )
            newMovableState = !this.isOverlayMovableResizable; // isResizable

        this.isOverlayMovableResizable = newMovableState;

        this.overlayWindow.setMovable( newMovableState );
        this.overlayWindow.setResizable( newMovableState );

        let ignoreMouseEvents = !newMovableState;

        if ( this.clickThroughMode === 'disabled' )
            ignoreMouseEvents = false;

        this.overlayWindow.setIgnoreMouseEvents(
            ignoreMouseEvents, {
                forward: true
            }
        );

        ipcMain.send( this.overlayWindow, 'set_movable', newMovableState );
        this.overlayWindow.show();

        if ( newMovableState ) {

            if ( this.overlayWindow.isFullScreen() )
                this.overlayWindow.setFullScreen( false );

            if ( this.overlayWindow.isMaximized() )
                this.overlayWindow.unmaximize();
            
            // this.overlayWindow.setBounds(
            //     this.mainWindow.getBounds()
            // );
        }

        return newMovableState;
    }

    async setOverlayBounds(
        input: {
            entireScreenMode?: 'fullscreen' | 'maximized',
            captureSourceDisplay?: Electron.Display,
            captureSourceWindow?: ExternalWindow,
            preventNegativeCoordinates?: boolean,
            isTaskbarVisible?: boolean,
            bounds?: Partial<Electron.Rectangle>,
            imageSize?: Electron.Size
        }
    ) {
        input.entireScreenMode = input.entireScreenMode || 'fullscreen';

        let {
            entireScreenMode,
            captureSourceDisplay,
            captureSourceWindow,
            bounds,
            imageSize
        } = input;

        // console.time("setOverlayBounds");

        if ( !this.automaticOverlayBounds )
            return;

        let newBounds: Partial<Electron.Rectangle> = { ...bounds };

        let isFullscreen = entireScreenMode === 'fullscreen';

        const currentDisplay = await this.getCurrentDisplay();

        if ( bounds?.width && bounds?.height ) {
            const display = captureSourceDisplay || currentDisplay;
            isFullscreen = (
                bounds?.width >= display.bounds.width &&
                bounds?.height >= display.bounds.height
            );
        }

        if ( isLinux && imageSize ) {
            bounds = {
                ...imageSize
            };
        }
        
        if ( captureSourceDisplay ) {

            if ( isMacOS ) {
                this.overlayWindow.setVisibleOnAllWorkspaces(
                    true,
                    {
                        visibleOnFullScreen: true,
                        skipTransformProcessType: true
                    }
                );
            }

            newBounds = {
                ...captureSourceDisplay?.workArea,
                ...bounds
            };
            this._setOverlayBounds( newBounds );

            if ( isFullscreen ) {
                if ( !isMacOS ) {
                    newBounds = {
                        ...captureSourceDisplay.bounds,
                        ...bounds
                    };
                    this._setOverlayBounds( newBounds );
                    this.overlayWindow.setFullScreen( true );
                }
                else {
                    this.overlayWindow.maximize();
                }
            }
            
            if ( entireScreenMode === 'maximized' )
                this.overlayWindow.maximize();
        }

        else if ( captureSourceWindow ) {

            let targetWindowBounds = {
                width: captureSourceWindow.size.width,
                height: captureSourceWindow.size.height,
                x: captureSourceWindow.position.x || 0,
                y: captureSourceWindow.position.y || 0,
                ...newBounds
            };

            // if ( imageSize ) {
            //     const xOffset = targetWindowBounds.width - imageSize.width;
            //     const yOffset = targetWindowBounds.height - imageSize.height;

            //     if ( xOffset > 0 )
            //         targetWindowBounds.x = targetWindowBounds.x + xOffset;

            //     if ( yOffset > 0 )
            //         targetWindowBounds.y = targetWindowBounds.y + yOffset;

            //     targetWindowBounds = {
            //         ...targetWindowBounds,
            //         ...imageSize
            //     };
            // }

            if ( input.preventNegativeCoordinates ) {
                if ( targetWindowBounds.x < 0 ) {
                    if ( input.isTaskbarVisible === false )
                        targetWindowBounds.width -= Math.abs(targetWindowBounds.x)
                    targetWindowBounds.x = 0;
                }

                if ( targetWindowBounds.y < 0 ) {
                    if ( input.isTaskbarVisible === false )
                        targetWindowBounds.height -= Math.abs(targetWindowBounds.y)
                    targetWindowBounds.y = 0;
                }
            }

            if ( isLinux && imageSize ) {
                const fullscreen = (
                    imageSize.width >= currentDisplay.size.width &&
                    imageSize.height >= currentDisplay.size.height
                );
                this.overlayWindow.setFullScreen(fullscreen);
            }
            else if ( isWindows ) {
                // Handling potential issues with DIP
                targetWindowBounds = screen.screenToDipRect( this.overlayWindow, targetWindowBounds );
            }

            await this._setOverlayBounds( targetWindowBounds );

            if (
                isWindows
            ) {
                const windowDisplay = screen.getDisplayNearestPoint({
                    x: targetWindowBounds.x + Math.floor(targetWindowBounds.width * 0.15),
                    y: targetWindowBounds.y + Math.floor(targetWindowBounds.height * 0.15)
                });

                const fullscreen = (
                    targetWindowBounds.width >= windowDisplay.size.width &&
                    targetWindowBounds.height >= windowDisplay.size.height
                );

                const maximized = (
                    targetWindowBounds.width >= windowDisplay.workAreaSize.width &&
                    targetWindowBounds.height >= windowDisplay.workAreaSize.height
                );

                if ( fullscreen || maximized ) {
                    await this._setOverlayBounds({
                        y: windowDisplay.bounds.y,
                        x: windowDisplay.bounds.x
                    });

                    if ( fullscreen ) {
                        this.overlayWindow.setFullScreen(true);
                    }
                    else if ( maximized ) {
                        this.overlayWindow.maximize();
                        if (
                            imageSize &&
                            targetWindowBounds.y < 0
                        ) {
                            const heightOffset = targetWindowBounds.height - imageSize.height;

                            if (
                                heightOffset === 1 &&
                                targetWindowBounds.y < -1
                            ) {
                                this._setOverlayBounds({
                                    ...windowDisplay.workArea,
                                    y: targetWindowBounds.y,
                                    height: windowDisplay.workArea.height + Math.abs(targetWindowBounds.y)
                                });
                            }
                            else {
                                this.overlayWindow.maximize();
                            }
                        }
                        else {
                            this.overlayWindow.maximize();
                        }
                    }
                }
            }

            // console.log({ targetWindowBounds });

            // Might be necessary to calculate and set twice
            // dipRect = screen.screenToDipRect( this.overlayWindow, targetWindowBounds )
            // this.overlayWindow.setBounds( dipRect );
        }
        else if ( bounds?.width && bounds?.height ) {

            const currentDisplay = await this.getCurrentDisplay();
            isFullscreen = (
                bounds?.width >= currentDisplay.size.width &&
                bounds?.height >= currentDisplay.size.height
            );
            
            this.overlayWindow.setFullScreen( isFullscreen );

            this._setOverlayBounds( bounds );
        }

        // console.timeEnd("setOverlayBounds");
    }

    async setBrowserPopupOverlayBounds( bounds: Partial<Electron.Rectangle> ): Promise< boolean > {
        
        const window = await this.getBrowserPopupWindow();

        if ( !window ) return false;

        windowManager.setForegroundWindow( window.handle );
        windowManager.setWindowBounds(
            window.handle,
            {
                x: bounds.x,
                y: bounds.y
            }
        );

        return true;
    }

    setAutomaticOverlayBounds( newState: boolean = true ) {
        this.automaticOverlayBounds = newState;
    }

    minimizeOverlayWindowToTray() {
        this.overlayWindow.hide();
        this.isOverlayWindowInTray = true;
    }

    async getBrowserPopupWindow(): Promise<WindowProperties | undefined> {
        const windowTitle = '(Browser pop pup)';

        let windows: WindowProperties[] = [];

        try {
            windows = await windowManager.searchWindow(windowTitle);    
        } catch (error) {
            console.error(error);
        }
        
        return windows.find( window => {
            if ( window.title.includes(windowTitle) ) {
                return true;
            }
        });
    }

    toggleClickThrough( value: boolean ) {

        if ( isWaylandDisplay && value ) {
            if ( this.overlayWindow.isFocused() )
                this.overlayWindow.blur();
        }

        this.overlayWindow.setIgnoreMouseEvents(
            value,
            { forward: true }
        );
    }

    private _setOverlayBounds( bounds: Partial<Electron.Rectangle> ) {
        console.log("\nsetOverlayBounds\n");

        if (
            isWaylandDisplay &&
            bounds.width !== undefined &&
            bounds.height !== undefined
        ) {
            return this.overlayWindow.webContents.executeJavaScript(`
                window.resizeTo(
                    ${bounds.width},
                    ${bounds.height}
                );
            `);
        }

        this.overlayWindow.setBounds( bounds );

        this.setBrowserPopupOverlayBounds( bounds );
    }

    private async getCurrentDisplay(): Promise<Electron.Display> {

        const cursorScreenPoint = await windowManager.getCursorPosition();
        const displayNearestPoint = screen.getDisplayNearestPoint(cursorScreenPoint);
        
        return displayNearestPoint;
    }

    applyTitleBarHideWorkaround() {
        // Hide the title bar in Electron v33+ (https://www.electronjs.org/blog/migrate-to-webcontentsview)
        this.overlayWindow.on( 'focus', () => {
            this.overlayWindow.setBackgroundColor('#00000000');
        });
        this.overlayWindow.on( 'blur', () => {
            this.overlayWindow.setBackgroundColor('#00000000');
        });
    }
}