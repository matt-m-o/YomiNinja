import http from 'http';
import url from "url";
import { Server } from 'socket.io';
import isDev from 'electron-is-dev';

export let httpServer = http.createServer( async (req, res) => {
    // const parsed = url.parse( String(req?.url), true )
});

export let socketServer = new Server( httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }    
});

httpServer.listen( 49_990 );