import * as x11 from 'x11';
import { TaskbarProperties, WindowManagerCppInterface, WindowProperties } from './window_manager';


export class WindowManagerLinuxX11 implements WindowManagerCppInterface {

    display: any;
    client: any;

    constructor(){}

    init = async () => {
        const display = await new Promise( function( resolve, reject ) {
            x11.createClient( ( error: any, display: any ) => {
        
                if (error)
                    return reject(error);
                                
                resolve( display );

            });
        }) as any;

        
        this.display = display;
        this.client = display.client;
    }

    setForegroundWindow( windowHandle: number ): void {
        this.client.SetInputFocus( windowHandle );
        this.client.RaiseWindow( windowHandle );
    }
    getWindowProperties( windowHandle: number ): WindowProperties {
        throw new Error('Method not implemented.');
    }
    getAllWindows() {
        throw new Error('Method not implemented.');
    }
    getTaskBarProps(): TaskbarProperties {
        throw new Error('Method not implemented.');
    }


    private getWindowTitle = async ( windowId: number, client: any ): Promise< string > => {

        client = client || this.client;

        return new Promise( function( resolve, reject ) {
            client.InternAtom( false, '_NET_WM_NAME', function ( wmNameError: any, wmNameAtom: any ) {

                if (wmNameError)
                    reject( wmNameError );

                client.InternAtom( false, 'UTF8_STRING', function ( utf8Error: any, utf8Atom: any ) {

                    if (utf8Error)
                        reject( utf8Error )

                    client.GetProperty( 0, windowId, wmNameAtom, utf8Atom, 0, 10000000, function( error: any, nameProp: any ) {
                        if ( error ) {
                            reject( error );
                        }                    
                        resolve( nameProp.data.toString() );
                    });
                });
            });
        });
    }

    private getAllWindowIds = async ( screenIdx = 0, display: any, client: any ): Promise< number[] > => {

        display = display || this.display;
        client = client || this.client;

        return new Promise( function( resolve, reject ) {

            const { root } = display.screen[ screenIdx ];

            client.QueryTree( root, (error: any, tree: any) => { 

                if (error)
                    reject( error );

                resolve(tree.children);
            });
        });
    }

}