import { BrowserWindow, IpcMainInvokeEvent, clipboard, globalShortcut, ipcMain } from "electron";
import { OverlayService } from "./overlay.service";
import { join } from "path";
import isDev from 'electron-is-dev';
import { format } from "url";
import { PAGES_DIR } from "../util/directories";
import { WindowManager } from "../../gyp_modules/window_management/window_manager";
import { SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";

export class OverlayController {

    private overlayService: OverlayService;
    private mainWindow: BrowserWindow;
    private overlayWindow: BrowserWindow;
    private windowManager: WindowManager;

    private overlayAlwaysOnTop: boolean = true;
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

        if ( settingsJson )
            this.overlayAlwaysOnTop = Boolean( settingsJson.overlay.behavior.always_on_top);

        this.createOverlayWindow();
        this.registersIpcHandlers();

        this.overlayWindow.on( 'show', () => {
            this.showOverlayWindow();
        });

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
        if (showDevTools)
            this.overlayWindow.webContents.openDevTools();        

        
        this.overlayWindow.setAlwaysOnTop( this.overlayAlwaysOnTop && !showDevTools, "normal" ); // normal, pop-up-menu och screen-saver

        // Prevents black image when using youtube on some browsers (e.g. Brave)
        this.overlayWindow.setIgnoreMouseEvents( !showDevTools, { // !showDevTools
            forward: !showDevTools,
        });
    }

    private registersIpcHandlers() {

        ipcMain.handle( 'user_command:copy_to_clipboard', ( event: IpcMainInvokeEvent, message: string ) => {

            if ( !message || message.length === 0 ) return;
            
            clipboard.writeText(message);
            
            const windows = this.windowManager.getAllWindows();
          
            const yomichanWindow = windows.find( window => window.title.includes( '- Yomichan Search' ) );
          
            if ( !yomichanWindow ) return;
          
            this.windowManager.setForegroundWindow( yomichanWindow.handle );
          
            console.log({ text_to_copy: message });
          
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
            this.overlayWindow.webContents.send( 'user_command:copy_to_clipboard' );
        });
        this.globalShortcutAccelerators.push( overlayHotkeys.show );

        // View overlay and clear
        globalShortcut.register( overlayHotkeys.show_and_clear, () => {

            this.showOverlayWindow();
            this.overlayWindow.webContents.send( 'user_command:clear_overlay' );
        });
        this.globalShortcutAccelerators.push( overlayHotkeys.show_and_clear );

    }

    private unregisterGlobalShortcuts() {

        this.globalShortcutAccelerators.forEach( accelerator => {
            globalShortcut.unregister( accelerator );
        });

        this.globalShortcutAccelerators = [];
    }

    private showOverlayWindow() {

        // this.windowManager.setForegroundWindow("OCR Overlay - YomiNinja");
        this.overlayWindow.setAlwaysOnTop( true, "normal" ); // normal, pop-up-menu och screen-saver

        if ( !this.overlayAlwaysOnTop )
            this.overlayWindow.setAlwaysOnTop( false );        
    }

    async refreshActiveSettingsPreset( settingsPresetJson?: SettingsPresetJson ) {

        if ( !settingsPresetJson ) {
            settingsPresetJson = ( await this.overlayService.getActiveSettingsPreset() )
                ?.toJson();
        }

        if ( !settingsPresetJson ) return;

        this.overlayAlwaysOnTop = Boolean( settingsPresetJson.overlay.behavior.always_on_top );
        this.overlayWindow?.setAlwaysOnTop( this.overlayAlwaysOnTop, "normal" );

        this.registerGlobalShortcuts( settingsPresetJson );

        this.overlayWindow?.webContents.send( 'settings_preset:active_data', settingsPresetJson );
    }
}