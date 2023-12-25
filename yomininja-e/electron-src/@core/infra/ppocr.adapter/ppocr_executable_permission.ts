import { exec } from "child_process";
import { join } from "path";


export function addExecutionPermissionToPPOCR( ppocrPath: string ): void {

    if ( process.platform !== 'linux' ) return;

    const shPath = join( ppocrPath, '/start.sh' );
    const executablePath = join( ppocrPath, '/ppocr_infer_service_grpc' );

    const commands = [
        `chmod +x ${shPath}`,
        `chmod +x ${executablePath}`
    ];

    commands.forEach( cmd => {

        exec( cmd, ( error, stdout, stderr ) => {

            if ( error ) {
                console.error(`Error executing xdotool: ${stderr}`);                
            }
            console.log( stdout );
        });
    });
}