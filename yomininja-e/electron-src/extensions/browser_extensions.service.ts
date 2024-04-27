import { BrowserWindow, app, session } from "electron";
import buildChromeContextMenu from "electron-chrome-context-menu";
import { ElectronChromeExtensions } from "electron-chrome-extensions";
import { PopupView } from "electron-chrome-extensions/dist/browser/popup";
import path, { join } from "path";
import fs from 'fs/promises';
import sharp from 'sharp';
import { USER_EXTENSIONS_DIR } from "../util/directories.util";
import isDev from "electron-is-dev";
import { BrowserExtensionManager } from "./browser_extension_manager/browser_extension_manager";
import { BrowserExtension, BrowserExtensionJson } from "../@core/domain/browser_extension/browser_extension";
import { UpdateBrowserExtensionUseCase } from "../@core/application/use_cases/browser_extension/update_browser_extension/update_browser_extension.use_case";
import { CreateBrowserExtensionUseCase } from "../@core/application/use_cases/browser_extension/create_browser_extension/create_browser_extension.use_case";
import { GetBrowserExtensionsUseCase } from "../@core/application/use_cases/browser_extension/get_browser_extensions/get_browser_extensions.use_case";
import { handleJPDBReaderPopup } from "./browser_extension_manager/workarounds/jpdb_reader";

export class BrowserExtensionsService {

    session: Electron.Session;
    extensionsApi: ElectronChromeExtensions;
    installedExtensions: Map< string, Electron.Extension > = new Map();
    windows: Map< number, BrowserWindow > = new Map();
    browserExtensionManager: BrowserExtensionManager;
    createBrowserExtensionUseCase: CreateBrowserExtensionUseCase;
    updateBrowserExtensionUseCase: UpdateBrowserExtensionUseCase;
    getBrowserExtensionsUseCase: GetBrowserExtensionsUseCase;

    onExtensionButtonClick: () => void = () => {};

    constructor(
        input: {
            browserExtensionManager: BrowserExtensionManager,
            createBrowserExtensionUseCase: CreateBrowserExtensionUseCase,
            updateBrowserExtensionUseCase: UpdateBrowserExtensionUseCase,
            getBrowserExtensionsUseCase: GetBrowserExtensionsUseCase,
        }
    ) {

        this.browserExtensionManager = input.browserExtensionManager;
        this.createBrowserExtensionUseCase = input.createBrowserExtensionUseCase;
        this.updateBrowserExtensionUseCase = input.updateBrowserExtensionUseCase;
        this.getBrowserExtensionsUseCase = input.getBrowserExtensionsUseCase;

        // Enable context menu
        app.on('web-contents-created', ( event, webContents ) => {

            webContents.setWindowOpenHandler( details => {

                this.createExtensionWindow( details.url );

                return { action: 'deny' };
            });

            webContents.on('context-menu', (e, params) => {

                const extensionMenuItems = this.extensionsApi.getContextMenuItems(webContents, params);

                // Refreshing every window on extension click
                extensionMenuItems.forEach( item => {
                    const { click } = item;
                    item.click = () => {
                        
                        click();

                        if ( !item.label.includes('10ten') )
                            return;

                        this.windows.forEach( window => {
                            window.reload();
                        });
                    }
                });

                const menu = buildChromeContextMenu({
                    params,
                    webContents,
                    extensionMenuItems,
                    openLink: (url, disposition) => {
                        this.createExtensionWindow( url );
                    }
                });

                menu.popup();
            });
        });

    }

    init = async () => {

        this.session = this.initSession();
        
        this.extensionsApi = new ElectronChromeExtensions({
            session: this.session,
            createTab: async ( details ): Promise< [Electron.WebContents, Electron.BrowserWindow] > => {

                const extensionWindow = this.createExtensionWindow( details.url || '' );

                return [ extensionWindow.webContents, extensionWindow ];
            },
            createWindow: async ( details: chrome.tabs.CreateProperties ): Promise< BrowserWindow > => {
                return this.createExtensionWindow( details.url || '' );
            },
        });

        this.extensionsApi.on( 'browser-action-popup-created', ( popup: PopupView ) => {

            const extension = this.installedExtensions.get( popup.extensionId );

            if ( extension?.name.includes('JPDBreader') )
                handleJPDBReaderPopup( popup );
        });
        
        // console.log({ EXTENSIONS_DIR });

        // await this.loadExtensions();

        // console.log(
        //     Array.from(this.installedExtensions)[0]
        // );
    }

    addBrowserWindow = async ( window: BrowserWindow, selectWindow?: boolean ) => {

        if ( !this.windows.has( window.id ) )
            this.windows.set( window.id, window );

        this.extensionsApi.addTab( window.webContents, window );

        if ( selectWindow )
            this.selectWindow( window )
    }

    // Select tab
    selectWindow = ( window: BrowserWindow ) => {
        this.extensionsApi.selectTab( window.webContents );
    }

    reloadWindows = () => {
        this.windows.forEach( window => {
            window.reload();
        });
    }

    getInstalledExtensions = async (): Promise< BrowserExtensionJson[] > => {


        const extensions: BrowserExtensionJson[] = [];

        // console.log( this.installedExtensions );
        // console.log( installedExtensions );

        for ( const item of Array.from( this.installedExtensions.values() ) ) {

            const extension = await this.electronExtensionToExtensionJson( item );

            extension.enabled = await this.isExtensionEnabled({
                extensionId: extension.id
            });

            extensions.push( extension );
        }

        return extensions;
    }

    loadExtensions = async () => {

        this.installedExtensions.forEach( extension => {
            this.session.removeExtension( extension.id );
        });
        this.installedExtensions.clear();

        const subDirectories = await fs.readdir( USER_EXTENSIONS_DIR, {
            withFileTypes: true,
        });
      
        const extensionDirectories = await Promise.all(
            subDirectories
                .filter( (dirEnt) => dirEnt.isDirectory() )
                .map( async (dirEnt) => {
        
                    const extPath = path.join( USER_EXTENSIONS_DIR, dirEnt.name );
            
                    if ( await this.manifestExists(extPath) ) {
                        return extPath;
                    }
            
                    const extSubDirs = await fs.readdir(extPath, {
                        withFileTypes: true,
                    });
            
                    const versionDirPath =
                        extSubDirs.length === 1 && extSubDirs[0].isDirectory()
                        ? path.join( extPath, extSubDirs[0].name )
                        : null;
            
                    if ( !versionDirPath ) return;
            
                    if ( await this.manifestExists(versionDirPath) ) {
                        return versionDirPath;
                    }
                })
        );
      
        for ( const extPath of extensionDirectories.filter(Boolean) ) {
            console.log(`Loading extension from ${extPath}`);
            
            if ( !extPath ) continue;
        
            try {

                const extension = await this.session.loadExtension(
                    extPath,
                    { allowFileAccess: !isDev } // Required in production
                );

                this.installedExtensions.set( extension.id, extension );

                const enabled = await this.isExtensionEnabled({
                    extension
                });

                if ( !enabled )
                    this.session.removeExtension( extension.id );

            } catch ( error ) {
                console.error( error );
            }
        }

        await this.syncExtensionsRegistry();
    }

    async handleBuiltinExtensions() {
        await this.browserExtensionManager.installBuiltinExtensions();
    }

    private manifestExists = async ( dirPath: string ): Promise< boolean > => {

        if ( !dirPath ) return false;
    
        try {
            const manifestPath = path.join(dirPath, 'manifest.json');
            return ( await fs.stat(manifestPath) ).isFile();
        } catch {
            return false;
        }
    }

    private initSession = (): Electron.Session => {

        const { defaultSession } = session;
          
        // const userAgent = defaultSession
        //   .getUserAgent()
        //   .replace(/\sElectron\/\S+/, '')
        //   .replace(new RegExp(`\\s${app.getName()}/\\S+`), '');
    
        defaultSession.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // const browserPreload = path.join( __dirname, '../preload.js' )
        // defaultSession.setPreloads([ browserPreload ]);
        
        return defaultSession;
    }

    private getExtensionIcon = async ( extensionId: string ): Promise< {
        icon: Buffer;
        icon_base64: string;
    } | undefined > => {

        const extension = this.installedExtensions.get( extensionId );

        if ( !extension ) return;

        const { icons } = extension.manifest;

        const iconRelativePath = icons?.['128'] ||
            icons?.['96'] ||
            icons?.['48'] ||
            icons?.['32'] ||
            icons?.['16'];

        const iconPath = join( extension.path, iconRelativePath );        
        
        const imageBuffer = await sharp( iconPath ).toBuffer();
        const imageBase64 = imageBuffer.toString( 'base64' );        

        return {
            icon: imageBuffer,
            icon_base64: imageBase64
        };        
    }


    openExtensionOptionsPage = async ( extensionId: string ): Promise<void> => {

        const extensions = await this.getInstalledExtensions();

        const extension = extensions.find( item => item.id === extensionId );

        if ( !extension || !extension?.optionsUrl )
            return;

        this.createExtensionWindow( extension.optionsUrl );
    }

    createExtensionWindow( url: string ): BrowserWindow {

        const extensionWindow = new BrowserWindow({
            width: 1200,
            height: 700,
            autoHideMenuBar: true,
            webPreferences: {
              sandbox: true,
              nodeIntegration: false,
              contextIsolation: true,
            }
        });

        extensionWindow.show();

        if ( url )
            extensionWindow.loadURL( url );

        return extensionWindow;
    }

    installExtension = async ( input: { zipFilePath: string } ) => {

        const { zipFilePath } = input;

        await this.browserExtensionManager.installZip( zipFilePath );

        await this.loadExtensions();

        this.reloadWindows();
    }

    uninstallExtension = async ( extension: BrowserExtensionJson ) => {

        const installedExtension = this.installedExtensions.get( extension.id );

        if ( !installedExtension ) return;

        this.browserExtensionManager.uninstall( installedExtension.path );

        await this.loadExtensions();

        this.windows.forEach( window => {
            window.reload();
        });
    }

    handleActionButtonClick = async () => {
        this.windows.forEach( window => {
            window.reload();
        });
    }

    syncExtensionsRegistry = async () => {

        const installedExtensions = await this.getInstalledExtensions();
        const extensionsInDb = await this.getBrowserExtensionsUseCase.execute();

        for ( const item of installedExtensions ) {

            const extensionIsRegistered = extensionsInDb.some(
                extensionInDb => extensionInDb.id === item.id
            );

            if ( !extensionIsRegistered ) {

                if ( item.name.includes('JPDBreader') )
                    item.enabled = false;
                
                await this.createBrowserExtensionUseCase.execute( item );
            }
            else
                await this.updateBrowserExtensionUseCase.execute( item );
        }
    }

    isExtensionEnabled = async (
        input: {
            extensionId?: string,
            extension?: Electron.Extension
        }
    ): Promise< boolean > => {

        const extensionId = input?.extensionId || input?.extension?.id;

        if ( !extensionId ) return false;

        const extensionsInDb = await this.getBrowserExtensionsUseCase.execute();

        const extension = extensionsInDb.find(
            extension => extension.id === extensionId
        );
        
        // Handle JPDBReader first load
        if ( input?.extension?.name.includes( 'JPDBreader' ) ) {
            if ( !extension ) return false;
        }

        if ( !extension ) return true;

        return extension.enabled;
    }


    electronExtensionToExtensionJson = async (
        electronExtension: Electron.Extension
    ) => {
        const optionsUiPage = electronExtension.manifest?.options_ui?.page;

        let optionsUrl: string | undefined;

        if ( optionsUiPage )
            optionsUrl = electronExtension.url + electronExtension.manifest?.options_ui?.page;

        const icon = await this.getExtensionIcon( electronExtension.id );

        let author = '';

        if ( typeof electronExtension.manifest.author === 'string' )
            author = electronExtension.manifest.author;

        else if ( electronExtension.manifest?.author?.email )
            author = electronExtension.manifest.author.email;

        const extension: BrowserExtensionJson = {
            id: electronExtension.id,
            name: electronExtension.name,
            description: electronExtension.manifest.description,
            author,
            version: electronExtension.manifest.version,
            optionsUrl,
            icon: icon?.icon,
            icon_base64: icon?.icon_base64,
            enabled: true
        };

        return extension;
    }

    toggleExtension = async ( extension: BrowserExtensionJson ) => {

        const enabled = !extension.enabled;

        await this.updateBrowserExtensionUseCase.execute({
            ...extension,
            enabled: !extension.enabled
        });

        if ( !enabled )
            this.session.removeExtension( extension.id );
        else
            await this.loadExtensions();
    }
}