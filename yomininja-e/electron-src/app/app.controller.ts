import { BrowserWindow, IpcMainInvokeEvent, Tray, nativeImage, app, clipboard, globalShortcut, ipcMain, Menu } from "electron";
import { UiohookKey, uIOhook } from "uiohook-napi";
import { CaptureSource, ExternalWindow } from "../ocr_recognition/common/types";
import { TaskbarProperties } from "../../gyp_modules/window_management/window_manager";
import { AppService, entireScreenAutoCaptureSource } from "./app.service";
import sharp from "sharp";
import os from 'os';
import { screen } from 'electron';
import { SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import { OcrRecognitionController } from "../ocr_recognition/ocr_recognition.controller";
import { createDebuggingWindow } from "../util/debugging/debugging.util";
import { mainController } from "../main/main.index";
import { browserExtensionsController } from "../extensions/extensions.index";
import isDev from 'electron-is-dev';
import { initializeApp } from "../@core/infra/app_initialization";
import { overlayController } from "../overlay/overlay.index";
import { ocrRecognitionController } from "../ocr_recognition/ocr_recognition.index";
import { settingsController } from "../settings/settings.index";
import { appInfoController } from "../app_info/app_info.index";
import { profileController } from "../profile/profile.index";
import { dictionariesController } from "../dictionaries/dictionaries.index";
import { ocrTemplateEvents, ocrTemplatesController } from "../ocr_templates/ocr_templates.index";
import { htmlMouseButtonToUiohook, matchUiohookMouseEventButton } from "../common/mouse_helpers";
import { debounce } from "lodash";
import { windowManager } from "node-window-manager";
import { screenCapturerController } from "../screen_capturer/screen_capturer.index";
import { ICONS_DIR } from "../util/directories.util";
import { join } from "path";
const isMacOS = process.platform === 'darwin';

let startupTimer: NodeJS.Timeout;

export class AppController {

    private appService: AppService;

    private mainWindow: BrowserWindow;
    private overlayWindow: BrowserWindow;
    
    private captureSourceDisplay: Electron.Display | undefined;        
    private userSelectedDisplayId: number | undefined;
    
    private captureSourceWindow: ExternalWindow | undefined;
    private userSelectedWindowId: number | undefined;

    private activeCaptureSource: CaptureSource;
    
    private taskbar: TaskbarProperties;

    private globalShortcutAccelerators: string[] = [];

    private showOverlayWindowWithoutFocus: boolean = false;

    private isEditingOcrTemplate: boolean = false;

    private isCaptureSourceUserSelected: boolean = false;

    private tray: Tray;

    constructor( input: {
        appService: AppService
    }) {

        this.appService = input.appService;

        if ( isMacOS && !windowManager.requestAccessibility() )
            return;

        uIOhook.start();
    }

    async init() {

        if ( !isDev ) {
            startupTimer = setTimeout( () => {
                console.log('Initialization took too long. Closing the app.');
                app.quit();
            }, 30_000 );
        }

        this.mainWindow = await mainController.init();
  
        await browserExtensionsController.init({
            mainWindow: this.mainWindow
        });

        // if ( isDev )
            // createDebuggingWindow();

        this.createTrayIcon();

        await initializeApp()
            .then( async () => {
            
                this.overlayWindow = await overlayController.init( this.mainWindow );
                
                
                ocrRecognitionController.init({
                    mainWindow: this.mainWindow,
                    overlayWindow: this.overlayWindow
                });
                
                settingsController.init( this.mainWindow );
                appInfoController.init( this.mainWindow );
                profileController.init( this.mainWindow );
                dictionariesController.init({
                    mainWindow: this.mainWindow,
                    overlayWindow: this.overlayWindow
                });
                ocrTemplatesController.init({
                    mainWindow: this.mainWindow,
                    overlayWindow: this.overlayWindow
                });

                await mainController.loadMainPage();
                
                // setTimeout( () => { // The timeout seems unnecessary
                    browserExtensionsController.addBrowserWindow( this.mainWindow, true );
                    browserExtensionsController.addBrowserWindow( this.overlayWindow, false );
                    await browserExtensionsController.loadExtensions();
                // }, 500 );

                if ( startupTimer ) {
                    clearTimeout( startupTimer );
                }
            });
                


        const settings = await this.appService.getActiveSettingsPreset();
        if ( !settings )
            throw new Error('no-active-settings-preset');

        this.showOverlayWindowWithoutFocus = Boolean( settings.overlay.behavior.show_window_without_focus );

        this.registerGlobalShortcuts( settings.toJson() );
        this.registersIpcHandlers();
        this.registerEventHandlers();
        this.handleCaptureSourceSelection();

        this.taskbar = this.appService.getTaskbar();

        this.activeCaptureSource = entireScreenAutoCaptureSource;
        
        screenCapturerController.init();
        screenCapturerController.onCapture( 
            async ( frame: Buffer ) => {
                return this._handleVideoStream( frame );
            }
        );
    }

    registersIpcHandlers() {

        ipcMain.handle( 'settings_preset:update', async ( event: IpcMainInvokeEvent, message: SettingsPresetJson ) => {

            if ( !message )
                return;
        
            const { restartOcrAdapter } = await settingsController.updateSettingsPreset( message );
        
            uIOhook.removeAllListeners();

            this.applySettingsPreset( message );
            overlayController.applySettingsPreset( message );
            ocrRecognitionController.applySettingsPreset( message );
        
            return {
                restartOcrAdapter
            };
        });

        ipcMain.handle( 'app:get_capture_sources',
            async ( event: IpcMainInvokeEvent ): Promise< CaptureSource[] > => {

                const sources = await this.appService.getAllCaptureSources();
                return sources;
            }
        );

        ipcMain.handle( 'app:get_active_capture_source',
            async ( event: IpcMainInvokeEvent ): Promise< CaptureSource > => {
                return this.activeCaptureSource;
            }
        );

        ipcMain.handle( 'app:set_capture_source',
            async ( event: IpcMainInvokeEvent, message: CaptureSource ): Promise< void > => {

                const { type, displayId } = message;

                this.userSelectedDisplayId = type === 'screen' && displayId != -1  ? 
                    message.displayId :
                    undefined;

                if ( !message?.displayId )
                    this.userSelectedWindowId = Number( message.id.split(':')[1] );
                else
                    this.userSelectedWindowId = undefined;

                this.activeCaptureSource = message;

                this.mainWindow.webContents.send(
                    'app:active_capture_source',
                    this.activeCaptureSource
                );

                await this.handleCaptureSourceSelection();
                this.setOverlayBounds( 'maximized' );
                
                // TODO: Only call when auto mode is enable
                if ( ocrTemplatesController.isAutoOcrEnabled )
                    screenCapturerController.createCaptureStream(true);

                this.isCaptureSourceUserSelected = true;
            }
        );

        ipcMain.handle( 'app:editing_ocr_template',
            async ( event: IpcMainInvokeEvent, message: boolean ): Promise< void > => {
                this.isEditingOcrTemplate = message;
                // console.log( 'app:editing_ocr_template: '+message );
            }
        );
    }

    registerEventHandlers() {
        ocrTemplateEvents.on( 'active_template', template => {
            const isAutoOcrEnabled = template?.isAutoOcrEnabled() || false;
            // console.log({ isAutoOcrEnabled });

            if ( !isAutoOcrEnabled )
                screenCapturerController.destroyScreenCapturer();

            if ( isAutoOcrEnabled && this.isCaptureSourceUserSelected )
                screenCapturerController.createCaptureStream();
        });
    }

    async registerGlobalShortcuts( settingsPresetJson?: SettingsPresetJson ) {
        
        if ( !settingsPresetJson ) {
            
            const settingsPreset = await this.appService.getActiveSettingsPreset();

            settingsPresetJson = settingsPreset?.toJson();
        }

        if ( !settingsPresetJson )
            return;

        const overlayHotkeys = settingsPresetJson.overlay.hotkeys;

        this.unregisterGlobalShortcuts();

        // Selected OCR engine hotkey
        if ( overlayHotkeys.ocr?.includes('Mouse') ) {
            uIOhook.on( 'mousedown', async ( e ) => {

                if ( !matchUiohookMouseEventButton( e, overlayHotkeys.ocr ) )
                    return;

                await this.handleOcrCommand();
            });
        }
        else if ( overlayHotkeys.ocr ) {
            globalShortcut.register( overlayHotkeys.ocr, this.handleOcrCommand );
            this.globalShortcutAccelerators.push( overlayHotkeys.ocr );
        }
        
        // OCR engine dedicated hotkeys
        settingsPresetJson.ocr_engines.forEach( engineSettings => {

            const { hotkey } = engineSettings;
            const engineName = engineSettings.ocr_adapter_name;

            if ( hotkey?.includes('Mouse') ) {
                uIOhook.on( 'mousedown', async ( e ) => {
    
                    if ( !matchUiohookMouseEventButton( e, hotkey ) )
                        return;
    
                    await this.handleOcrCommand();
                });
            }
            else if ( hotkey ) {
                globalShortcut.register(
                    hotkey,
                    () => this.handleOcrCommand({ engineName })
                );
                this.globalShortcutAccelerators.push( hotkey );
            }

        });
        
        if ( overlayHotkeys.ocr_on_screen_shot ) {
            uIOhook.on( 'keyup', async ( e ) => {

                if ( e.keycode !== UiohookKey.PrintScreen ) return;
                
                                        
                const runFullScreenImageCheck = e.altKey && !this.taskbar.auto_hide;

                // console.log({ runFullScreenImageCheck });
                // console.log({ userPreferredDisplayId: this.userPreferredDisplayId });
                // console.log({ captureSourceDisplay: this.captureSourceDisplay });

                const multipleDisplays = screen.getAllDisplays().length > 1;
                const isWindowImage = Boolean(e.altKey);

                if ( multipleDisplays ) {

                    if ( !isWindowImage )
                        return this.handleOcrCommand();
                        // return this.ocrRecognitionController.recognize();
                    
                    if ( isWindowImage && this.userSelectedWindowId )
                        return this.handleOcrCommand({ image: clipboard.readImage().toPNG() });
                        // return this.ocrRecognitionController.recognize( clipboard.readImage().toPNG() );

                    else
                        return this.handleOcrCommand({
                            image: clipboard.readImage().toPNG(),
                            runFullScreenImageCheck //: false
                        });
                        // return this.ocrRecognitionController.recognize( clipboard.readImage().toPNG(), runFullScreenImageCheck );
                }
                else {

                    if ( this.userSelectedWindowId )
                        return this.handleOcrCommand({
                            image: clipboard.readImage().toPNG()
                        });
                        // return this.ocrRecognitionController.recognize( clipboard.readImage().toPNG() );

                    return this.handleOcrCommand({
                        image: clipboard.readImage().toPNG(),
                        runFullScreenImageCheck
                    });
                    // return this.ocrRecognitionController.recognize( clipboard.readImage().toPNG(), runFullScreenImageCheck );
                }
                
            });
        }
    }

    private unregisterGlobalShortcuts() {

        this.globalShortcutAccelerators.forEach( accelerator => {
            globalShortcut.unregister( accelerator );
        });

        this.globalShortcutAccelerators = [];
    }

    private showOverlayWindow() {

        if ( this.showOverlayWindowWithoutFocus )
            this.overlayWindow.showInactive();
        else
            this.overlayWindow.show();
    }

    async applySettingsPreset( settingsPresetJson?: SettingsPresetJson ) {

        if ( !settingsPresetJson ) {
            settingsPresetJson = ( await this.appService.getActiveSettingsPreset() )
                ?.toJson();
        }

        if ( !settingsPresetJson )
            return;

        this.showOverlayWindowWithoutFocus = Boolean( settingsPresetJson.overlay.behavior.show_window_without_focus );

        this.registerGlobalShortcuts( settingsPresetJson );
    }

    setOverlayBounds( entireScreenMode: 'fullscreen' | 'maximized' = 'fullscreen' ) {
        // console.time("setOverlayBounds");

        if ( overlayController.isOverlayBoundsLocked )
            return;

        const isFullscreen = entireScreenMode === 'fullscreen';
        
        if ( this.captureSourceDisplay ) {

            if ( isMacOS ) {
                this.overlayWindow.setVisibleOnAllWorkspaces(
                    true,
                    {
                        visibleOnFullScreen: true,
                        skipTransformProcessType: true
                    }
                );
            }
            
            this.overlayWindow.setBounds({                
                ...this.captureSourceDisplay?.workArea,
            });

            if ( isFullscreen ) {
                if ( !isMacOS ) {
                    this.overlayWindow.setFullScreen( true );
                }
                else {
                    this.overlayWindow.setBounds(
                        screen.getPrimaryDisplay().bounds
                    );
                }
            }
            
            if ( entireScreenMode === 'maximized' )
                this.overlayWindow.maximize();
        }

        else if ( this.captureSourceWindow ) {

            let targetWindowBounds = {
                width: this.captureSourceWindow.size.width,
                height: this.captureSourceWindow.size.height,
                x: this.captureSourceWindow.position.x,
                y: this.captureSourceWindow.position.y,
            };

            if ( os.platform() === 'linux' )
                this.overlayWindow.setFullScreen( false );

            if ( os.platform() === 'win32' ) {
                // Handling potential issues with DIP
                targetWindowBounds = screen.screenToDipRect( this.overlayWindow, targetWindowBounds );
            }

            this.overlayWindow.setBounds( targetWindowBounds );

            // console.log({ targetWindowBounds });

            // Might be necessary to calculate and set twice
            // dipRect = screen.screenToDipRect( this.overlayWindow, targetWindowBounds )
            // this.overlayWindow.setBounds( dipRect );
        }

        // console.timeEnd("setOverlayBounds");
    }


    handleDisplaySource() {

        if ( this.userSelectedDisplayId !== undefined ) {
            this.captureSourceDisplay = this.appService.getDisplay( this.userSelectedDisplayId );
            return;
        }

        if ( 
            this.userSelectedDisplayId === undefined &&
            !this.userSelectedWindowId
        ) 
            this.captureSourceDisplay = this.appService.getCurrentDisplay();
        else 
            this.captureSourceDisplay = undefined;        
    }

    async handleWindowSource() {      
        
        if ( this.userSelectedWindowId )
            this.captureSourceWindow = await this.appService.getExternalWindow( this?.userSelectedWindowId );

        else 
            this.captureSourceWindow = undefined;

        // console.log( this.captureSourceWindow );
    }

    async handleCaptureSourceSelection() {
        // console.time('handleCaptureSourceSelection');
        this.handleDisplaySource();
        await this.handleWindowSource();
        // console.timeEnd('handleCaptureSourceSelection');
    }

    private async isFullScreenImage( imageBuffer: Buffer ): Promise<boolean> {

        const metadata = await sharp(imageBuffer).metadata();

        if ( 
            !this.captureSourceDisplay ||
            !metadata?.width ||
            !metadata?.height
         )
            return false;        

        if ( 
            metadata.width >= this.captureSourceDisplay?.size.width &&
            metadata.height >= this.captureSourceDisplay?.size.height
        ) {
            return true;
        }

        return false
    }

    handleOcrCommand = async ( input: OcrCommandInput = {} ) => {
        await this.debouncedOcrCmdHandler( input );
    }

    debouncedOcrCmdHandler = debounce( async ( input: OcrCommandInput = {} ) => {
        await this._handleOcrCommand( input );
    }, 50 );

    _handleOcrCommand = async (
        input: OcrCommandInput = {}
    ) => {

        // console.log('AppController.handleOcrCommand');

        let {
            image,
            runFullScreenImageCheck,
            engineName
        } = input;

        this.overlayWindow?.webContents.send( 'user_command:toggle_results', false );
        this.overlayWindow?.webContents.send( 'ocr:processing_started' );
        
        await this.handleCaptureSourceSelection();

        image = await this.appService.getCaptureSourceImage({
            image,
            display: this.captureSourceDisplay,
            window: this.captureSourceWindow,
        });

        if ( !image ) return;

        // Setting overlay bounds
        let isFullScreenImage = true;
        if ( image && runFullScreenImageCheck)
            isFullScreenImage = await this.isFullScreenImage(image);
        this.setOverlayBounds( isFullScreenImage ? 'fullscreen' :  'maximized' );
        this.showOverlayWindow();
        this.overlayWindow?.webContents.send( 'user_command:toggle_results', false );

        if ( this.isEditingOcrTemplate ) {
            this.mainWindow.webContents.send(
                'app:capture_source_image',
                {
                    image,
                    imageBase64 :image.toString('base64')
                }
            );
            this.mainWindow.show();
        }
        else {
            await ocrRecognitionController.recognize({
                image,
                engineName
            })
                .catch( console.error );
        }

        this.overlayWindow?.webContents.send( 'ocr:processing_complete' );
        this.showOverlayWindow();
        this.overlayWindow?.webContents.send( 'user_command:toggle_results', true );
    };

    async _handleVideoStream( image: Buffer ) {

        if ( isDev )
            console.log('AppController._handleVideoStream');

        // this.overlayWindow?.webContents.send( 'ocr:processing_started' );
        
        // await this.handleCaptureSourceSelection();

        if ( !image ) return;

        // this.setOverlayBounds( 'maximized' );
        // this.showOverlayWindow();

        if ( this.isEditingOcrTemplate ) {
            return;
        }
        else {
            
            if ( ocrRecognitionController.isRecognizing() )
                return;

            await ocrRecognitionController.recognize({
                    image,
                    autoOcr: true
                })
                .catch( console.error );
        }

        // this.overlayWindow?.webContents.send( 'ocr:processing_complete' );
        // this.showOverlayWindow();
        // this.overlayWindow?.webContents.send( 'user_command:toggle_results', true );
    }

    createTrayIcon() {

        const { platform } = process;

        const appName = app.getName();
        const appIconFile = platform === 'win32' ?
            'icon.ico' :
            'icon_512x512.png';

        const toggleMainWindow = ( show?: boolean ) => {

            if ( show )
                return this.mainWindow.show();

            if ( this.mainWindow.isVisible() )
                return this.mainWindow.hide();
            
            this.mainWindow.show();
        }
        
        if ( !isMacOS ) {

            const iconPath = join( ICONS_DIR, appIconFile );
            const trayIcon = nativeImage.createFromPath( iconPath );
            trayIcon.resize({ width: 16, height: 16, quality: 'best' });

            this.tray = new Tray( trayIcon );
            this.tray.setToolTip( appName );
            this.tray.on( 'click', () => toggleMainWindow( true ) );
            const contextMenu = Menu.buildFromTemplate([
                {
                    label: `Hide/Show ${app.getName()}`,
                    click: ( item ) => toggleMainWindow()
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Hide/Show Overlay',
                    click: ( item ) => {
                        if ( this.overlayWindow.isVisible() ) 
                            return this.overlayWindow.hide();

                        this.showOverlayWindow();
                    }
                },
                {
                    label: 'Manually Move/Resize Overlay',
                    type: 'checkbox',
                    click: ( item ) => {
                        item.checked = overlayController.toggleMovable();
                    },
                    accelerator: 'Ctrl+Shift+M'
                },
                {
                    label: 'Overlay Automatic Adjustment',
                    toolTip: 'Overlay Auto Positioning and Resizing',
                    type: 'checkbox',
                    checked: !overlayController.isOverlayBoundsLocked,
                    click: ( event ) => {
                        overlayController.lockOverlayBounds( !event.checked );
                    },
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    click: () => app.quit()
                }
            ]);
            this.tray.setContextMenu(contextMenu);
        }
    }
}

type OcrCommandInput = {
    image?: Buffer;
    runFullScreenImageCheck?: boolean;
    engineName?: string;
}