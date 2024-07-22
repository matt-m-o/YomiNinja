// import * as x11 from 'x11';
import { TaskbarProperties, WindowManagerNativeInterface, WindowProperties } from '../window_manager';
import { exec } from 'child_process';


type XDoToolWindowGeometry = {
    WINDOW: number;
    X: number;
    Y: number;
    WIDTH: number;
    HEIGHT: number;
    SCREEN: number;
};

export class WindowManagerLinuxXDoTool implements WindowManagerNativeInterface {


    async searchWindowByTitle( title: string ): Promise<WindowProperties[]> {

        console.log(`searchWindowByTitle: ${title}`);

        const ids = await this.searchWindowByName( title );
        const windows: WindowProperties[] = [];

        for( const id of ids ) {

            const window = await this.getWindowProperties( id );

            if (!window) continue;

            windows.push( window );
        }

        return windows;
    }


    async setForegroundWindow( windowHandle: number ): Promise< void >{

        console.log(`setForegroundWindow: ${windowHandle}`);
        
        this.activateWindow( windowHandle );
    }

    async getWindowProperties( windowHandle: number ): Promise< WindowProperties | undefined > {

        console.log(`getWindowProperties: ${windowHandle}`);

        const windowGeometry = await this.getWindowGeometry( windowHandle );

        if ( !windowGeometry ) {
            console.log(`window ${windowHandle} doesn't exists!`);
            return;
        }
        
        const title = await this.getWindowName( windowHandle );

        return {
            handle: windowHandle,
            title,
            size: {
                width: windowGeometry.WIDTH,
                height: windowGeometry.HEIGHT,
            },
            position: {
                x: windowGeometry.X,
                y: windowGeometry.Y
            }
        }
    }

    async getAllWindows(): Promise< WindowProperties[] > {

        const ids = await this.searchWindowByName('');
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


    activateWindow( windowId: number ) {
        const command = `xdotool windowactivate ${windowId}`;
        
        exec( command, ( error, stdout, stderr ) => {

            if ( error ) {
                console.error(`Error executing xdotool: ${stderr}`);                
            }            
        });        
    }

    searchWindowByName( windowName: string ): Promise< number[] > {

        const command = `xdotool search --onlyvisible --name "${windowName}"`;

        return new Promise( ( resolve, reject ) => {

            exec( command, ( error, stdout, stderr ) => {

                if ( error ) {
                    console.error(`Error executing xdotool: ${stderr}`);
                    reject( [] );
                }
                
                const outputLines = stdout.trim().split('\n');

                const ids = outputLines.map( line => parseInt( line, 10 ) );

                resolve( ids );
            });
        });

    }

    async getWindowName( windowHandle: number ): Promise< string > {

        const command = `xdotool getwindowname ${windowHandle}`;

        return new Promise( ( resolve, reject ) => {

            exec( command, ( error, stdout, stderr ) => {

                if ( error ) {
                    console.error(`Error executing xdotool: ${stderr}`);
                    reject( '' );
                }
                
                const name = stdout.trim().replace( '\n', '' );

                resolve( name );
            });
        });
    }

    async getWindowGeometry( windowHandle: number ): Promise< XDoToolWindowGeometry | null > {

        const command = `xdotool getwindowgeometry --shell ${windowHandle}`;

        return new Promise( ( resolve, reject ) => {

            exec( command, (error, stdout, stderr) => {

                if ( error ) {
                    console.error(`Error executing xdotool: ${stderr}`);
                    reject( null );
                }

                const outputLines = stdout.trim().split('\n');

                const values = outputLines.map( line => {
                    const value = line.split('=')[1];
                    return parseInt( value, 10 );
                });
    
                const geometry: XDoToolWindowGeometry = {
                    WINDOW: values[0],
                    X:  values[1],
                    Y: values[2],
                    WIDTH: values[3],
                    HEIGHT: values[4],
                    SCREEN: values[5],
                };
    
                resolve( geometry );
            });
        });
   
    }

}