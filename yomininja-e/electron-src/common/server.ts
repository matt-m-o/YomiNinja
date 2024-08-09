import http from 'http';
import url from "url";
import { Server } from 'socket.io';
import isDev from 'electron-is-dev';
import { getNextPortAvailable } from '../@core/infra/util/port_check';
import fs from 'fs';
import path from 'path';
import { PAGES_DIR } from '../util/directories.util';

export let httpServer = http.createServer( async (req, res) => {
    // const parsed = url.parse( String(req?.url), true )
    let filePath = req.url === '/' ? '/index.html' : String(req.url);
    filePath = path.join(
      isDev ? './renderer/out' : PAGES_DIR,
      filePath || ''
    );
  
    fs.access( filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        } else {
            
            fs.readFile( filePath, (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal server error');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                }
            });
        }
    });
});

export let socketServer = new Server( httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }    
});

export let httpServerPort = 10_010;

getNextPortAvailable( httpServerPort )
    .then( port => {
        httpServerPort = port || httpServerPort - 1;
        console.log("\nHTTP Server port: "+httpServerPort);
        httpServer.listen( httpServerPort );
    });