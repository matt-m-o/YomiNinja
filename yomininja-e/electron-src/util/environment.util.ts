import { exec } from "child_process";

export const isMacOS = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';
export const isWindows = process.platform === 'win32';
export let httpCliTool: 'wget' | 'curl' = 'wget';
export let httpServerPort = 10_010;
export let desktopEnvironment: string | undefined;

export const isWaylandDisplay = (
    process.platform === 'linux' &&
    Boolean( process.env.WAYLAND_DISPLAY )
);


export async function detectHttpCliToolCmd() {

    const curlCommand = `curl -o- http://localhost:${httpServerPort}`;
    const wgetCommand = `wget -qO- http://localhost:${httpServerPort}`;

    const testCommand = async ( command: string ) => {
        return new Promise( ( resolve, reject ) => {

            exec( command, ( error, stdout, stderr ) => {

                if ( error )
                    return resolve(false);

                resolve(true);
            });
        });
    }

    const curlAvailable = await testCommand( curlCommand );
    const wgetAvailable = await testCommand( wgetCommand );

    if ( curlAvailable )
        httpCliTool = 'curl';

    else if ( wgetAvailable )
        httpCliTool = 'wget';
}

export function setHttpServerPort( port: number ) {
    httpServerPort = port;
}

async function getDesktopEnvironment(): Promise<string | undefined> {
    const command = 'echo $XDG_CURRENT_DESKTOP';

    return new Promise( ( resolve, reject ) => {

        exec( command, ( error, stdout, stderr ) => {

            if ( error ) {
                console.error(`Error executing "${command}": ${stderr}`);
                return resolve(undefined);
            }
            
            const output = stdout.trim().replace( '\n', '' );

            resolve( output );
        });
    });
}

getDesktopEnvironment()
    .then( result => { 
        desktopEnvironment = result;
    });