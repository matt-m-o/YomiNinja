import http from 'http';
import url from "url";
import { Server } from 'socket.io';
import isDev from 'electron-is-dev';
import { getNextPortAvailable } from '../@core/infra/util/port_check';
import fs from 'fs';
import path from 'path';
import { PAGES_DIR } from '../util/directories.util';
import mimeTypes from 'mime-types';
import { customBrowserExtensionsAPI } from '../extensions/custom_browser_extensions_api/browser/api/browser_api';

export let httpServer = http.createServer( async (req, res) => {

    const parsedUrl = url.parse( String(req?.url), true )

    let filePath = req.url === '/' ? '/index.html' : String(req.url);
    filePath = path.join(
      isDev ? './renderer/out' : PAGES_DIR,
      filePath || ''
    );

    if ( req.method == "POST" ) {
        if ( parsedUrl.pathname?.includes('chrome-api') ) {
            console.log({ pathname: parsedUrl.pathname })
            await customBrowserExtensionsAPI.router(
                parsedUrl,
                req,
                res
            );
            return;
        }
    }
  
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
                    const contentType = mimeTypes.lookup(
                        path.extname(filePath)
                    );

                    if ( contentType )
                        res.writeHead(200, { 'Content-Type': contentType });
                    else
                        res.writeHead(200);

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