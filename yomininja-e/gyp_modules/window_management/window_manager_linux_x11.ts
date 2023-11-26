import * as x11 from 'x11';
import { TaskbarProperties, WindowManagerCppInterface, WindowProperties } from './window_manager';


export class WindowManagerLinuxX11 implements WindowManagerCppInterface {

    display: any;
    client: any;

    constructor(){}

    async init() {

        const display = await new Promise( ( resolve, reject ) => {
            x11.createClient( ( error: any, display: any ) => {
        
                if ( error )
                    return reject( error );
                                
                resolve( display );

            });
        }) as any;

        this.display = display;
        this.client = display.client;
    }

    async setForegroundWindow( windowHandle: number ): Promise< void >{

        console.log(`setForegroundWindow: ${windowHandle}`);
        
        let windowExists = await this.windowExists( windowHandle );

        if ( !windowExists ) {
            windowHandle++;
            windowExists = await this.windowExists( windowHandle );
        }

        if ( !windowExists ) return;
        
        const title = await this.getWindowTitle( windowHandle );        

        if ( !title ) return;

        this.client.SetInputFocus( windowHandle );
        this.client.RaiseWindow( windowHandle );
    }

    async getWindowProperties( windowHandle: number ): Promise< WindowProperties | undefined > {

        console.log(`getWindowProperties: ${windowHandle}`);

        const exists = await this.windowExists( windowHandle );
        console.log(`${windowHandle} exists: ${exists}`);

        if ( !exists ) return;

        const title = await this.getWindowTitle( windowHandle );

        return new Promise( ( resolve, reject ) => {

            this.client.GetGeometry ( windowHandle, ( error: any, geometry: any ) => {

                if ( error )
                    reject( error );
            
                const { xPos, yPos, width, height } = geometry;

                resolve({
                    handle: windowHandle,
                    title,
                    size: {
                        width,
                        height,
                    },
                    position: {
                        x: xPos,
                        y: yPos
                    }
                });                
            });
        });
    }

    async getAllWindows(): Promise< WindowProperties[] > {

        const ids = await this.getAllWindowIds();
        const windows: WindowProperties[] = [];

        for ( const id of ids ) {

            const window = await this.getWindowProperties( id );

            if ( window )
                windows.push( window );
        }

        return windows;
    }
    
    getTaskBarProps(): TaskbarProperties {
        return {
            auto_hide: true,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 0,
                height: 0
            }
        }
    }


    private async getWindowTitle( windowId: number ): Promise< string > {

        const exists = await this.windowExists( windowId );
        if ( !exists ) return '';

        return new Promise( ( resolve, reject ) => {
            this.client.InternAtom( false, '_NET_WM_NAME', ( wmNameError: any, wmNameAtom: any ) => {

                if ( wmNameError )
                    reject( wmNameError );

                this.client.InternAtom( false, 'UTF8_STRING', ( utf8Error: any, utf8Atom: any ) => {

                    if (utf8Error)
                        reject( utf8Error )

                    this.client.GetProperty( 0, windowId, wmNameAtom, utf8Atom, 0, 10000000, ( error: any, nameProp: any ) => {

                        if ( error )
                            reject( error );

                        resolve( nameProp?.data.toString() || '' );
                    });
                });
            });
        });
    }

    private async getAllWindowIds( ): Promise< number[] > {

        let allWindowIds: Set< any > = new Set();

        for( const screen of this.display.screen ) {

            const { root } = screen;

            const screenWindowIds: number[] = await( new Promise( ( resolve, reject ) => {

                this.client.QueryTree( root, ( error: any, tree: any ) => { 

                    if ( error )
                        reject( error );

                    if ( !tree?.children )
                        return;

                    resolve( tree.children );
                });

            }));
            
            screenWindowIds.forEach( id => allWindowIds.add( id ) );
        }

        // console.log({ allWindowIds })
        
        return Array.from( allWindowIds );
    }

    private async windowExists( windowHandle: number ): Promise< boolean > {

        const ids = await this.getAllWindowIds();

        return ids.some( id => id === windowHandle );
    }

}