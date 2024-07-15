import { IpcRenderer } from "electron";
import io, { Socket } from 'socket.io-client';


export class IpcRendererUniversal implements IpcRenderer {

    electronIpcRenderer: IpcRenderer | undefined;;
    socket: Socket;

    constructor() {

        if ( typeof window === 'undefined' )
            return;

        if ( !global?.ipcRenderer ) {
            this.socket = io('http://localhost:49990');
            
            this.socket.on('connect', () => {
                console.log('IPC Socket Connected!');
            });
        }
        else
            this.electronIpcRenderer = global?.ipcRenderer;
    }

    async invoke( channel: string, ...args: any[] ): Promise<any> {
        
        if ( this.electronIpcRenderer ) {
            return await this.electronIpcRenderer.invoke( channel, ...args );   
        }

        if ( this.socket ) {

            return await new Promise( ( resolve, reject ) => {
                this.socket.emit(
                    channel,
                    args[0],
                    resolve
                );
            });
            
        }
    }

    on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): this {

        this.electronIpcRenderer?.on(channel, listener);
        this.socket?.on( channel, listener );

        return this;
    }

    addListener(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    off(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    once(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    postMessage(channel: string, message: any, transfer?: MessagePort[]): void {
        throw new Error("Method not implemented.");
    }
    removeAllListeners(channel: string): this {
        this.electronIpcRenderer?.removeAllListeners(channel);
        this.socket?.removeAllListeners(channel);
        return this;
    }
    removeListener(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): this {
        this.electronIpcRenderer?.removeListener( channel, listener );
        this.socket?.removeListener( channel, listener );

        return this;
    }

    send(channel: string, ...args: any[]): void {
        throw new Error("Method not implemented.");
    }
    sendSync(channel: string, ...args: any[]) {
        throw new Error("Method not implemented.");
    }
    sendToHost(channel: string, ...args: any[]): void {
        throw new Error("Method not implemented.");
    }
    setMaxListeners(n: number): this {
        throw new Error("Method not implemented.");
    }
    getMaxListeners(): number {
        throw new Error("Method not implemented.");
    }
    listeners(event: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    rawListeners(event: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    emit(event: string | symbol, ...args: any[]): boolean {
        throw new Error("Method not implemented.");
    }
    listenerCount(event: string | symbol): number {
        throw new Error("Method not implemented.");
    }
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    eventNames(): Array<string | symbol> {
        throw new Error("Method not implemented.");
    }
}

export const ipcRenderer = new IpcRendererUniversal();