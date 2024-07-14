import electron, { BrowserWindow } from "electron";
import { socketServer } from '../common/server';


export class IpcMainUniversal implements electron.IpcMain {

    private ipcMain: electron.IpcMain = electron.ipcMain;

    handle( channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => (Promise<any>) | (any) ): void {
        this.ipcMain.handle( channel, listener );

        socketServer.on('connect', ( socket ) => {
            socket.on( channel, async ( data, callback ) => {
                callback( await listener( {} as Electron.IpcMainEvent, data ) );
            });
        });
    }
    
    handleOnce(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => (Promise<any>) | (any)): void {
        this.ipcMain.handleOnce( channel, listener );
    }

    on(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void): this {
        this.ipcMain.on( channel, listener );
        return this;
    }

    once(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void): this {
        this.ipcMain.once( channel, listener );
        return this;
    }

    removeAllListeners(channel?: string): this {
        this.ipcMain.removeAllListeners( channel );
        return this;
    }

    removeHandler(channel: string): void {
        this.ipcMain.removeHandler( channel );
    }

    removeListener(channel: string, listener: (...args: any[]) => void): this {
        this.ipcMain.removeListener( channel, listener );
        return this;
    }

    addListener(event: string | symbol, listener: (...args: any[]) => void): this {
        this.ipcMain.addListener( event, listener );
        return this;
    }

    off(event: string | symbol, listener: (...args: any[]) => void): this {
        this.ipcMain.off( event, listener );
        return this;
    }

    setMaxListeners(n: number): this {
        this.ipcMain.setMaxListeners( n );
        return this;
    }

    getMaxListeners(): number {
        return this.ipcMain.getMaxListeners();
    }

    listeners(event: string | symbol): Function[] {
        return this.ipcMain.listeners( event );
    }

    rawListeners(event: string | symbol): Function[] {
        return this.ipcMain.rawListeners( event );
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        return this.ipcMain.emit( event, ...args );
    }

    listenerCount(event: string | symbol): number {
        return this.ipcMain.listenerCount( event );
    }

    prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
        this.ipcMain.prependListener( event, listener );
        return this;
    }

    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
        this.ipcMain.prependOnceListener( event, listener );
        return this;
    }

    eventNames(): Array<string | symbol> {
        return this.ipcMain.eventNames();
    }

    // Send an asynchronous message to the renderer process ( webContents.send... )
    send( window: BrowserWindow, channel: string, data?: any ) {
        window?.webContents?.send( channel, data );
        socketServer.sockets.emit( channel, undefined, data );
    }
}

export const ipcMain = new IpcMainUniversal();