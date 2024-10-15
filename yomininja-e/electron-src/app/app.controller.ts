import { BrowserWindow, IpcMainInvokeEvent, Tray, nativeImage, app, clipboard, globalShortcut, Menu, DisplayBalloonOptions, NativeImage, systemPreferences } from "electron";
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
import { cloneDeep, debounce } from "lodash";
import { windowManager } from "node-window-manager";
import { screenCapturerController } from "../screen_capturer/screen_capturer.index";
import { ICONS_DIR } from "../util/directories.util";
import { join } from "path";
import { sleep } from "../util/sleep.util";
import electronIsDev from "electron-is-dev";
import { ipcMain } from "../common/ipc_main";
import { isLinux, isWaylandDisplay, isWindows, isMacOS } from "../util/environment.util";
import { googleLensOcrAdapterName } from "../@core/infra/ocr/google_lens_ocr.adapter/google_lens_ocr_settings";
import { ppOcrAdapterName } from "../@core/infra/ocr/ppocr.adapter/ppocr_settings";
import { mangaOcrAdapterName } from "../@core/infra/ocr/manga_ocr.adapter/manga_ocr_settings";
import { appleVisionAdapterName } from "../@core/infra/ocr/apple_vision.adapter/apple_vision_settings";
import { cloudVisionOcrAdapterName } from "../@core/infra/ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings";
import url from "url";

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

    private tray: Tray | undefined;
    private temporaryTray: Tray | undefined;

    private previousOcrCommandData: OcrCommandInput;
    private remoteControlKey: string;

    constructor( input: {
        appService: AppService
    }) {

        this.appService = input.appService;
    }

    async init() {
        console.time('YomiNinja Startup time');

        if ( !isDev ) {
            startupTimer = setTimeout( () => {
                console.log('Initialization took too long. Closing the app.');
                this.displayBalloon({
                    content: 'The app is about to exit in 10 seconds. Please restart the app once it has exited.'
                });
                sleep(10_000)
                    .then( () => {
                        app.quit();
                        process.exit();
                    });
            }, 45_000 );//
        }

        this.mainWindow = await mainController.init();
  
        await browserExtensionsController.init({
            mainWindow: this.mainWindow
        });

        // if ( isDev )
            // createDebuggingWindow();

        this.createTemporaryTrayIcon();

        await initializeApp()
            .then( async () => {
            
                this.overlayWindow = await overlayController.init( this.mainWindow );

                ocrRecognitionController.init({
                    mainWindow: this.mainWindow,
                    overlayWindow: this.overlayWindow
                });
                
                settingsController.init( this.mainWindow );
                appInfoController.init( this.mainWindow );
                profileController.init({
                    mainWindow: this.mainWindow,
                    overlayWindow: this.overlayWindow
                });
                dictionariesController.init({
                    mainWindow: this.mainWindow,
                    overlayWindow: this.overlayWindow
                });
                ocrTemplatesController.init({
                    mainWindow: this.mainWindow,
                    overlayWindow: this.overlayWindow
                });

                await mainController.loadMainPage( false );
                
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

        this.remoteControlKey = settings.overlay.hotkeys.remote_control_key;


        const isSystemStartup = process.argv.some( arg =>
            arg.includes('systemStartup')
        );

        const startMinimized =  (
            isSystemStartup &&
            settings.general?.run_at_system_startup === 'minimized'
        );
        
        if ( startMinimized )
            overlayController.minimizeOverlayWindowToTray();
        else 
            this.mainWindow.show();

        this.showOverlayWindowWithoutFocus = Boolean( settings.overlay.behavior.show_window_without_focus );

        this.registerGlobalShortcuts( settings.toJson() );
        this.registersIpcHandlers();
        this.registerEventHandlers();
        this.handleCaptureSourceSelection();

        this.taskbar = this.appService.getTaskbar();
        
        await this.appService.init();
        this.activeCaptureSource = this.appService.entireScreenCaptureSource;
        
        screenCapturerController.init();
        screenCapturerController.setCaptureSource( this.activeCaptureSource );

        if ( !isWaylandDisplay ) {
            screenCapturerController.createCapturer({
                captureSource: this.activeCaptureSource,
                streamFrames: false
            });
        }
        screenCapturerController.onStreamFrame( 
            async ( frame: Buffer ) => {
                return this._handleVideoStream( frame );
            }
        );

        screenCapturerController.onScreenshot( 
            async ( image: Buffer ) => {
                return await this.handleOcrCommand({
                    ...cloneDeep( this.previousOcrCommandData ),
                    image,
                    preventNegativeCoordinates: false,
                    autoCrop: false
                });
            }
        );

        this.destroyTemporaryTrayIcon();
        this.createTrayIcon();

        if (
            isMacOS &&
            !systemPreferences.isTrustedAccessibilityClient(false)
        ) {
            systemPreferences.isTrustedAccessibilityClient(true);
        }
        console.timeEnd('YomiNinja Startup time');
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
            async ( event: IpcMainInvokeEvent, types: ('screen' | 'window')[] | undefined ): Promise< CaptureSource[] > => {

                const sources = await this.appService.getAllCaptureSources(types);
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

                if ( this.userSelectedWindowId && !isWaylandDisplay ) {
                    this.captureSourceWindow = await this.appService.getExternalWindow(
                        this.userSelectedWindowId
                    );
                    this.activeCaptureSource.window = this.captureSourceWindow;
                }

                ipcMain.send(
                    this.mainWindow,
                    'app:active_capture_source',
                    this.activeCaptureSource
                );
                
                await this.handleCaptureSourceSelection()
                    .catch( console.error );

                overlayController.activeCaptureSource = this.activeCaptureSource;
                
                if ( this.activeCaptureSource.type === 'screen' )
                    this.setOverlayBounds({ entireScreenMode: 'fullscreen' }); 
                else
                    this.setOverlayBounds({ entireScreenMode: 'maximized' }); 
                
                // console.log({
                //     isAutoOcrEnabled: ocrTemplatesController.isAutoOcrEnabled
                // });
                
                screenCapturerController.createCapturer({
                    captureSource: this.activeCaptureSource,
                    force: true,
                    streamFrames: ocrTemplatesController.isAutoOcrEnabled
                });
                
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
        ocrTemplateEvents.on( 'active_template', async (template) => {
            const isAutoOcrEnabled = template?.isAutoOcrEnabled() || false;

            if ( electronIsDev )
                console.log({ isAutoOcrEnabled });

            if ( !isAutoOcrEnabled )
                await screenCapturerController.stopStream();

            if ( isAutoOcrEnabled && this.isCaptureSourceUserSelected ) {
                screenCapturerController.createCapturer({
                    captureSource: this.activeCaptureSource,
                    force: false,
                    streamFrames: isAutoOcrEnabled
                });
            }
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

    async remoteControlRouter( url: url.UrlWithParsedQuery  ): Promise< boolean > {

        const parameters = url.query;
        
        if ( !('key' in parameters) ) return false;

        const key = parameters['key'];

        if ( key != this.remoteControlKey ) {
            console.log("\nInvalid Remote Control key!!!\n");
            return false;
        }

        const command = url.pathname?.split('/remote-control/')[1];

        if ( !command ) return false;

        if ( command === 'ocr' ) {
            await this.handleOcrCommand();
            return true;
        }
        else if ( command === 'ocr/apple-vision' ) {
            await this.handleOcrCommand({ engineName: appleVisionAdapterName });
            return true;
        }
        else if ( command === 'ocr/google-lens' ) {
            await this.handleOcrCommand({ engineName: googleLensOcrAdapterName });
            return true;
        }
        else if ( command === 'ocr/cloud-vision' ) {
            await this.handleOcrCommand({ engineName: cloudVisionOcrAdapterName });
            return true;
        }
        else if ( command === 'ocr/paddleocr' ) {
            await this.handleOcrCommand({ engineName: ppOcrAdapterName });
            return true;
        }
        else if ( command === 'ocr/mangaocr' ) {
            await this.handleOcrCommand({ engineName: mangaOcrAdapterName });
            return true;
        }
        else {
            if ( await overlayController.remoteControlRouter( command ) )
                return true;
        }

        return false;
    }

    private showOverlayWindow( input?: { showInactive: boolean, displayResults: boolean }) {
        if ( input ) {
            return overlayController.showOverlayWindow({
                ...input,
                isElectronEvent: false,
            });
        }
        overlayController.showOverlayWindow();
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
        this.remoteControlKey = settingsPresetJson.overlay.hotkeys.remote_control_key;
    }

    setOverlayBounds( input: {
        entireScreenMode?: 'fullscreen' | 'maximized';
        preventNegativeCoordinates?: boolean;
        bounds?: Partial<Electron.Rectangle>;
        imageSize?: Electron.Size
    }) {
        let {
            entireScreenMode,
            preventNegativeCoordinates,
            bounds,
            imageSize
        } = input;

        entireScreenMode = entireScreenMode || 'fullscreen';

        overlayController.setOverlayBounds({
            entireScreenMode,
            captureSourceDisplay: this.captureSourceDisplay,
            captureSourceWindow: this.captureSourceWindow,
            preventNegativeCoordinates,
            isTaskbarVisible: !Boolean(this.taskbar?.auto_hide),
            bounds,
            imageSize
        });
    }


    async handleDisplaySource() {

        if ( this.userSelectedDisplayId !== undefined ) {
            this.captureSourceDisplay = this.appService.getDisplay( this.userSelectedDisplayId );
            return;
        }

        if ( 
            this.userSelectedDisplayId === undefined &&
            !this.userSelectedWindowId
        ) 
            this.captureSourceDisplay = await this.appService.getCurrentDisplay();
        else 
            this.captureSourceDisplay = undefined;        
    }

    async handleWindowSource() {
        
        if ( this.userSelectedWindowId ) {
            this.captureSourceWindow = await this.appService.getExternalWindow( this?.userSelectedWindowId );
            this.activeCaptureSource.window = this.captureSourceWindow;
        }
        else 
            this.captureSourceWindow = undefined;

        // console.log( this.captureSourceWindow );
    }

    async handleCaptureSourceSelection() {
        // console.time('handleCaptureSourceSelection');

        await this.handleDisplaySource();

        if ( !isWaylandDisplay )
            await this.handleWindowSource();

        // console.timeEnd('handleCaptureSourceSelection');
        if ( !isWaylandDisplay )
            await screenCapturerController.setCaptureSource( this.activeCaptureSource );
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
            engineName,
            preventNegativeCoordinates,
            autoCrop
        } = input;

        if ( overlayController.isOverlayMovableResizable )
            return;

        if ( !input.image ) {
            this.previousOcrCommandData = input;
            const screenshotSuccess = screenCapturerController.screenshot({
                captureSource: this.activeCaptureSource
            });

            if ( screenshotSuccess ) return;
        }

        ipcMain.send( this.overlayWindow, 'user_command:toggle_results', false );
        ipcMain.send( this.overlayWindow, 'ocr:processing_started' );
        
        await this.handleCaptureSourceSelection();

        preventNegativeCoordinates = preventNegativeCoordinates !== undefined ?
            preventNegativeCoordinates :
            Boolean( image );

        
        image = await this.appService.getCaptureSourceImage({
            image,
            display: this.captureSourceDisplay,
            window: this.captureSourceWindow,
            autoCrop
        });

        if ( !image ) return;

        let imageSize: Promise<Electron.Size> | undefined;

        if ( isLinux || isWindows ) {
            imageSize = ( async () => {
                const imageMetadata = await sharp(image).metadata();
                return {
                    width: imageMetadata.width || 0,
                    height: imageMetadata.height || 0
                }
            })();
        }

        // Setting overlay bounds
        let isFullScreenImage = true;
        if ( image && runFullScreenImageCheck)
            isFullScreenImage = await this.isFullScreenImage(image);

        this.setOverlayBounds({
            entireScreenMode: isFullScreenImage ? 'fullscreen' :  'maximized',
            preventNegativeCoordinates,
            imageSize: imageSize ? await imageSize : undefined
        });
        this.showOverlayWindow({ showInactive: true, displayResults: false }); // This can cause problems with JPDBReader extension // Warning: Unknown display value, please report this!
        ipcMain.send( this.overlayWindow, 'user_command:toggle_results', false );

        if ( this.isEditingOcrTemplate ) {
            ipcMain.send(
                this.mainWindow,
                'app:capture_source_image',
                {
                    image,
                    imageBase64: Buffer.from(image).toString('base64')
                }
            );
            this.mainWindow.show();
        }
        else {

            try {
                const response = await ocrRecognitionController.recognize({
                    image,
                    engineName
                });

                if ( response.status === 'replaced' )
                    return;
            }
            catch (error) {
                console.error(error);
            }
        }

        ipcMain.send( this.overlayWindow, 'ocr:processing_complete' );
        this.showOverlayWindow();
        ipcMain.send( this.overlayWindow, 'user_command:toggle_results', true );
    };

    async _handleVideoStream( image: Buffer ) {

        if ( isDev )
            console.log('AppController._handleVideoStream');

        // ipcMain.send( this.overlayWindow, 'ocr:processing_started' );
        
        // await this.handleCaptureSourceSelection();

        if ( overlayController.isOverlayMovableResizable )
            return;

        if ( !image ) return;

        // this.setOverlayBounds( 'maximized' );
        // this.showOverlayWindow();

        if ( this.isEditingOcrTemplate ) {
            return;
        }
        else {
            
            if ( ocrRecognitionController.isRecognizing() )
                return;

            await ocrRecognitionController.autoRecognize({
                    image
                })
                .catch( console.error );
        }

        // ipcMain.send( this.overlayWindow, 'ocr:processing_complete' );
        // this.showOverlayWindow();
        // ipcMain.send( this.overlayWindow, 'user_command:toggle_results', true );
    }

    toggleMainWindow = ( show?: boolean ) => {

        if ( !this.mainWindow )
            return;

        if ( show )
            return this.mainWindow.show();

        if ( this.mainWindow.isVisible() )
            return this.mainWindow.hide();
        
        this.mainWindow.show();
    }

    createBaseTrayIcon(): Tray {

        const tray = new Tray( this.getAppIcon() );
        tray.setToolTip( app.name );

        return tray;
    }

    createTrayIcon() {

        this.tray = this.createBaseTrayIcon();

        this.tray.on( 'click', () => this.toggleMainWindow( true ) );

        const contextMenu = Menu.buildFromTemplate([
            {
                id: 'ocr',
                label: `OCR`,
                click: ( item ) => this.handleOcrCommand(),
            },
            {
                type: 'separator'
            },
            {
                label: `Hide/Show ${app.getName()}`,
                click: ( item ) => this.toggleMainWindow()
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
                label: 'Automatic Overlay Adjustment',
                toolTip: 'Overlay Auto Positioning and Resizing',
                type: 'checkbox',
                checked: overlayController.automaticOverlayBounds,
                click: ( event ) => {
                    event.checked = !overlayController.automaticOverlayBounds
                    overlayController.setAutomaticOverlayBounds( event.checked );
                },
            },
            {
                label: 'Fullscreen Overlay',
                toolTip: 'Toggle Fullscreen Mode',
                type: 'checkbox',
                checked: this.overlayWindow.isFullScreen(),
                click: ( event ) => {
                    const newState = !this.overlayWindow.isFullScreen();
                    this.overlayWindow.setFullScreen( newState );
                    event.checked = newState;
                }
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

    createTemporaryTrayIcon() {
        this.temporaryTray = this.createBaseTrayIcon();
        this.temporaryTray.setToolTip(`${app.name} - Please wait, the app is loading...`);
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Quit',
                click: () => app.quit()
            }
        ]);
        this.temporaryTray.setContextMenu( contextMenu );
    }


    destroyTemporaryTrayIcon() {

        if (
            !this.temporaryTray ||
            this.temporaryTray.isDestroyed()
        )
            return;

        this.temporaryTray.destroy();
        this.temporaryTray = undefined;
    }

    displayBalloon( options: Partial<DisplayBalloonOptions> ) {

        if ( options.respectQuietTime !== undefined )
            options.respectQuietTime = options.respectQuietTime;
        else
            options.respectQuietTime = true;

        (this.temporaryTray || this.tray)
            ?.displayBalloon({
                ...options,
                title: 'YomiNinja',
                content: options.content || '',
                icon: this.getAppIcon()
            });
    }

    getAppIcon(): NativeImage {

        let appIconFile = 'icon_512x512.png';

        if ( isMacOS )
            appIconFile = 'icon_64x64@3x.png';

        else if ( process.platform === 'win32' )
            appIconFile = 'icon.ico';

        const iconPath = join( ICONS_DIR, appIconFile );
        
        return nativeImage.createFromPath( iconPath );
    }
}

export type OcrCommandInput = {
    image?: Buffer;
    runFullScreenImageCheck?: boolean;
    engineName?: string;
    preventNegativeCoordinates?: boolean;
    autoCrop?: boolean;
}