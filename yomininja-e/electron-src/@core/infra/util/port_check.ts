import net from 'net';


export async function isPortInUse( port: number, host = '0.0.0.0' ): Promise< boolean > {
        return new Promise(( resolve, reject ) => {
      
            const client = new net.Socket();
        
            client.connect( port, host, () => {
                resolve(true);
                client.end();
                client.destroy();
            });
        
            client.on('error', (err) => {
                resolve(false);
                client.end();
                client.destroy();
            });
        });
    }

export async function getNextPortAvailable( port: number, host = '0.0.0.0' ): Promise< number | undefined > {

    while( port < 65_535 ) {

        const inUse = await isPortInUse( port, host );

        if ( !inUse ) return port;

        port++;
    }

    return;
}