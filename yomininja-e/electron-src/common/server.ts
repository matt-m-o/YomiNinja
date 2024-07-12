import http from 'http';
import url from "url";
import { Server } from 'socket.io';
import isDev from 'electron-is-dev';

export let socketServer: Server;
export let httpServer: http.Server;

export function createServer( port: number = 9000 ) {
    httpServer = http.createServer( async (req, res) => {
        // const parsed = url.parse( String(req?.url), true )
    });

    socketServer = new Server( httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }    
    });

    socketServer.on( 'connection', ( socket ) => {
        // console.log("New socket connected");
    });
    
    httpServer.listen(port);

    return httpServer;
}