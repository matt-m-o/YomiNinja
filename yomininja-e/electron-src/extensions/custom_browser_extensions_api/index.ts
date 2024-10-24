import electronIsDev from 'electron-is-dev';
import fs from 'fs';
import { join } from 'path';
import { BUILTIN_EXTENSIONS_DIR } from '../../util/directories.util';

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

    let preloadFilePath = '';

    if ( electronIsDev ) {
        preloadFilePath = join(
            __dirname,
            '../custom_browser_extensions_api/renderer/renderer.js'
        );
    }
    else {
        preloadFilePath = join(
            BUILTIN_EXTENSIONS_DIR,
            '/renderer.js'
        );
    }

    
    try {
        let preloadFile = fs.readFileSync( preloadFilePath, 'utf-8' );
        preloadFile = patchPreloadFile( preloadFile );

        const destinationPath = join(extensionPath, '/preload.js')

        fs.writeFileSync( destinationPath, preloadFile, 'utf-8' );

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

    } catch (error) {
        console.error(error);
    }
}


function patchPreloadFile( file: string ): string {
    const lineToRemove = 'Object.defineProperty(exports, "__esModule", { value: true });';

    if ( !file.includes(lineToRemove) ) return file;

    file = file.replace( lineToRemove, '');
    return file;
}