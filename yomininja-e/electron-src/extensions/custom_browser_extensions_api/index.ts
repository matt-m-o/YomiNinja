import fs from 'fs';
import { join } from 'path';

export function injectPreloadFile(
    input: {
        manifest: chrome.runtime.Manifest,
        extensionPath: string,
    }
) {
    const {
        manifest,
        extensionPath
    } = input;

    if ( manifest.manifest_version <= 2 )
        return;

    const preloadFilePath = join(
        __dirname,
        '../custom_browser_extensions_api/renderer/renderer.js'
    );

    patchPreloadFile( preloadFilePath );

    const destinationPath = join(extensionPath, '/preload.js')
    
    fs.copyFileSync(
        preloadFilePath,
        destinationPath
    );

    const serviceWorkerPath = join(
        extensionPath,
        // @ts-ignore 
        manifest.background.service_worker
    );

    const serviceWorkerFile = fs.readFileSync( serviceWorkerPath, 'utf-8' );
    const firstImportIdx = serviceWorkerFile.indexOf('import');

    const patch = `import './preload.js';\n`;

    if ( serviceWorkerFile.includes(patch) )
        return;

    const contentsBefore = serviceWorkerFile.slice( 0, firstImportIdx );
    const rest = serviceWorkerFile.slice( firstImportIdx );

    const updatedFileContents = contentsBefore + patch + rest;

    fs.writeFileSync( serviceWorkerPath, updatedFileContents, 'utf-8' );
}


function patchPreloadFile( filePath: string ) {
    const lineToRemove = 'Object.defineProperty(exports, "__esModule", { value: true });';

    let file = fs.readFileSync( filePath, 'utf-8' );

    if ( !file.includes(lineToRemove) ) return;

    file = file.replace( lineToRemove, '');
    fs.writeFileSync( filePath, file, 'utf-8' );
}