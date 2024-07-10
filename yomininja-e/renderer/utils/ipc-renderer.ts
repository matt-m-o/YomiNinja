import { IpcRenderer } from "electron";
import { reject } from "lodash";

type Listener = {
    channel: string;
    handler: ( event: any, data: any ) => any;
}

export class IpcRendererUniversal implements IpcRenderer {

    electronIpcRenderer: IpcRenderer | undefined;;
    webSocket: WebSocket | undefined;
    private wsListeners: Map< string, Listener[] > = new Map();

    constructor() {

        if ( typeof window === 'undefined' )
            return;

        if ( !global?.ipcRenderer ) {
            this.webSocket = new WebSocket('ws://localhost:6677');
            this.webSocket.addEventListener( 'message', this.handleWebSocketEvent );
        }
        else
            this.electronIpcRenderer = global?.ipcRenderer;
    }

    async invoke( channel: string, ...args: any[] ): Promise<any> {

        // console.log(`Invoking channel: ${channel}`);
        // console.log({
        //     data: args[0]
        // })
        
        if ( this.electronIpcRenderer ) {
            return await this.electronIpcRenderer.invoke( channel, ...args );   
        }

        if ( this.webSocket ) {

            await new Promise( ( resolve, reject ) => {
                this.webSocket.send( 
                    JSON.stringify({
                        channel,
                        data: args[0]
                    })
                );
            })
            
        }
    }

    on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): this {

        // console.log(`Invoking channel: ${channel}`);

        this.electronIpcRenderer?.on(channel, listener);

        if ( !this.wsListeners.get(channel) )
            this.wsListeners.set(channel, []);

        this.wsListeners.get(channel).push({
            channel,
            handler: listener
        });

        return this;
    }

    handleWebSocketEvent = ( message: MessageEvent ) => {

        if ( typeof message.data !== 'object' )
            return;

        if ( !('channel' in message.data) )
            return;

        const channel = message.data.channel;

        for ( const listener of this.wsListeners.get(channel) ) {
            if ( listener.channel === listener.channel ) {
                listener.handler( '', message.data.data );
            }
        }
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
        this.wsListeners.delete(channel);
        return this;
    }
    removeListener(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): this {
        this.electronIpcRenderer?.removeListener(channel, listener);
        this.wsListeners.set(
            channel,
            this.wsListeners.get(channel)
                .filter(
                    l => l.channel !== channel && 
                    l.handler !== listener
                )
        );

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