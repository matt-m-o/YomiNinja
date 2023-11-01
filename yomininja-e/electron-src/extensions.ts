import { BrowserWindow, app, session } from "electron";
import buildChromeContextMenu from "electron-chrome-context-menu";
import { ElectronChromeExtensions } from "electron-chrome-extensions";
import path from "path";
import fs from 'fs/promises';

export class BrowserExtensions {

    session: Electron.Session;
    extensionsApi: ElectronChromeExtensions;
    installedExtensions: Electron.Extension[];
    windows: Map< number, BrowserWindow > = new Map();

    onExtensionButtonClick: () => void = () => {};

    constructor() {}

    async init() {

        this.session = this.initSession();
        
        this.extensionsApi = new ElectronChromeExtensions({
            session: this.session,
            createTab: async ( details ) => {
                
                const extensionWindow = new BrowserWindow({
                    autoHideMenuBar: true,
                    webPreferences: {
                      sandbox: true,
                      nodeIntegration: false,
                      contextIsolation: true,
                    }
                });                

                if (details.url) {                    
                    extensionWindow.loadURL( details.url );
                    console.log(details.url);
                }

                extensionWindow.show();

                return [ extensionWindow.webContents, extensionWindow];
            }
        });

        // Enable context menu
        app.on('web-contents-created', ( event, webContents ) => {
            webContents.on('context-menu', (e, params) => {

                const extensionMenuItems = this.extensionsApi.getContextMenuItems(webContents, params);

                // Refreshing every window on extension click
                extensionMenuItems.forEach( item => {
                    const { click } = item;
                    item.click = () => {
                        click();
                        for ( const [ id, window ] of this.windows.entries() ) {
                            window.reload();
                        }
                    }
                });

                const menu = buildChromeContextMenu({
                    params,
                    webContents,
                    extensionMenuItems,
                    openLink: (url, disposition) => {
                        webContents.loadURL(url);
                    }
                });
            
                menu.popup();

                console.log(this.installedExtensions[0])
                console.log(this.installedExtensions[0].manifest)
            });
        });

        this.installedExtensions = await this.loadExtensions(
            this.session,
            path.join(__dirname, '../../data/extensions')
        );

        // console.log(
        //     this.installedExtensions[0].manifest.commands
        // );
    }

    async addBrowserWindow( window: BrowserWindow ) {

        this.windows.set( window.id, window );

        this.extensionsApi.addTab( window.webContents, window );
        this.extensionsApi.selectTab( window.webContents );
    }

    private async loadExtensions( session: Electron.Session, extensionsPath: string ) {

        const subDirectories = await fs.readdir( extensionsPath, {
            withFileTypes: true,
        });
      
        const extensionDirectories = await Promise.all(
            subDirectories
                .filter( (dirEnt) => dirEnt.isDirectory() )
                .map( async (dirEnt) => {
        
                    const extPath = path.join(extensionsPath, dirEnt.name);
            
                    if ( await this.manifestExists(extPath) ) {
                        return extPath;
                    }
            
                    const extSubDirs = await fs.readdir(extPath, {
                        withFileTypes: true,
                    });
            
                    const versionDirPath =
                        extSubDirs.length === 1 && extSubDirs[0].isDirectory()
                        ? path.join(extPath, extSubDirs[0].name)
                        : null;
            
                    if ( !versionDirPath ) return;
            
                    if ( await this.manifestExists(versionDirPath) ) {
                        return versionDirPath;
                    }
                })
        );
      
        const extensions = [];
      
        for ( const extPath of extensionDirectories.filter(Boolean) ) {
            console.log(`Loading extension from ${extPath}`);
            
            if ( !extPath ) continue;
        
            try {
                const extension = await session.loadExtension(extPath);
                extensions.push(extension);
            } catch ( error ) {
                console.error( error );
            }
        }
      
        return extensions;
    }

    private async manifestExists( dirPath: string ): Promise< boolean > {

        if ( !dirPath ) return false;
    
        try {
            const manifestPath = path.join(dirPath, 'manifest.json');
            return ( await fs.stat(manifestPath) ).isFile();
        } catch {
            return false;
        }
    }

    private initSession(): Electron.Session {

        const { defaultSession } = session;
          
        const userAgent = defaultSession
          .getUserAgent()
          .replace(/\sElectron\/\S+/, '')
          .replace(new RegExp(`\\s${app.getName()}/\\S+`), '');
    
        defaultSession.setUserAgent(userAgent);
        
        return defaultSession;
    }
}

export const browserExtensions = new BrowserExtensions();