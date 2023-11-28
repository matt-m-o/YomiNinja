import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from "electron";
import { BrowserExtensionsService } from "./browser_extensions.service";
import { BrowserExtension } from "./browser_extension";



export class BrowserExtensionsController {

    browserExtensionsService: BrowserExtensionsService;

    constructor( input: { browserExtensionsService: BrowserExtensionsService } ) {

        this.browserExtensionsService = input.browserExtensionsService;
    }

    async init() {
        this.registersIpcHandlers();
        await this.browserExtensionsService.init();
    }

    private registersIpcHandlers() {
        
        ipcMain.handle( 'dictionaries:get_all_extensions', 
            async ( event: IpcMainInvokeEvent ): Promise< BrowserExtension[] > => {
                return await this.browserExtensionsService.getInstalledExtensions();
            }
        );

        ipcMain.handle( 'dictionaries:open_extension_options', 
            async ( event: IpcMainInvokeEvent, extension: BrowserExtension ): Promise< void > => {
                return await this.browserExtensionsService.openExtensionOptionsPage( extension.id );
            }
        );
    }

    addBrowserWindow( window: BrowserWindow ) {

        this.browserExtensionsService.addBrowserWindow( window );
    }
}