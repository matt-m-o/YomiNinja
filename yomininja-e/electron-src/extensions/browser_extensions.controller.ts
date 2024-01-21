import { BrowserWindow, IpcMainInvokeEvent, dialog, ipcMain } from "electron";
import { BrowserExtensionsService } from "./browser_extensions.service";
import { InAppNotification } from "../common/types/in_app_notification";
import { BrowserExtensionJson } from "../@core/domain/browser_extension/browser_extension";



export class BrowserExtensionsController {

    browserExtensionsService: BrowserExtensionsService;
    mainWindow: BrowserWindow;

    constructor( input: { browserExtensionsService: BrowserExtensionsService } ) {

        this.browserExtensionsService = input.browserExtensionsService;
    }

    async init( input: { mainWindow: BrowserWindow } ) {

        this.registersIpcHandlers();
        await this.browserExtensionsService.init();

        this.mainWindow = input.mainWindow;
    }

    private registersIpcHandlers() {

        ipcMain.handle( 'extensions:install_extension',
            async ( event: IpcMainInvokeEvent ): Promise< void > => {

                const filters: Electron.FileFilter[] = [{
                    name: 'Zipped Chrome Extension',
                    extensions: [ 'zip' ]
                }];

                const { filePaths } = await dialog.showOpenDialog(
                    this.mainWindow,
                    {
                        properties: ['openFile'],
                        filters,
                    }
                );

                const filePath = filePaths?.[0];

                if ( !filePath ) return;
                
                // console.log( filePath );

                await this.browserExtensionsService.installExtension({
                    zipFilePath: filePath
                })
                    .catch( error => {
                        console.error( error );

                        const notification: InAppNotification = {
                            type: 'error',
                            message: 'Extension installation has failed!'
                        };

                        this.mainWindow.webContents.send(
                            'notifications:show',
                            notification
                        );
                    });
            }
        );
        
        ipcMain.handle( 'extensions:get_all_extensions', 
            async ( event: IpcMainInvokeEvent ): Promise< BrowserExtensionJson[] > => {
                return await this.browserExtensionsService.getInstalledExtensions();
            }
        );

        ipcMain.handle( 'extensions:open_extension_options', 
            async ( event: IpcMainInvokeEvent, extension: BrowserExtensionJson ): Promise< void > => {
                return await this.browserExtensionsService.openExtensionOptionsPage( extension.id );
            }
        );

        ipcMain.handle( 'extensions:handle_action_button_click', 
            async ( event: IpcMainInvokeEvent ): Promise< void > => {
                return await this.browserExtensionsService.handleActionButtonClick();
            }
        );

        ipcMain.handle( 'extensions:uninstall_extension', 
            async ( event: IpcMainInvokeEvent, extension: BrowserExtensionJson ): Promise< void > => {
                return await this.browserExtensionsService.uninstallExtension( extension );
            }
        );

        ipcMain.handle( 'extensions:toggle_extension', 
            async ( event: IpcMainInvokeEvent, extension: BrowserExtensionJson ): Promise< void > => {
                return await this.browserExtensionsService.toggleExtension( extension );
            }
        );
    }

    addBrowserWindow( window: BrowserWindow, selectWindow?: boolean ) {
        this.browserExtensionsService.addBrowserWindow( window, selectWindow );
    }

    async loadExtensions() {
        await this.browserExtensionsService.loadExtensions();
        this.browserExtensionsService.reloadWindows();
    }
}