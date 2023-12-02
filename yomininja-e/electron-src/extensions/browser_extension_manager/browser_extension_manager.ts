import path from "path";
import fs from "fs"
import StreamZip, { StreamZipAsync } from "node-stream-zip";


export class BrowserExtensionManager {

    extensionsPath: string;

    constructor( input?: { extensionsPath?: string }) {

        this.extensionsPath = input?.extensionsPath || './extensions';
    }


    async install( zipFilePath: string ): Promise< string > {

        const isValid = await this.validateExtensionZip( zipFilePath );

        if ( !isValid )
            throw new Error('invalid-extension');
        
        const fileName = path.basename( zipFilePath ).split('.zip')[0];
            
        const extractedExtensionPath = path.join( this.extensionsPath, fileName );

        if ( !fs.existsSync( extractedExtensionPath ))
            fs.mkdirSync( extractedExtensionPath, { recursive: true } );

        const zip = new StreamZip.async({ file: zipFilePath });

        const count = await zip.extract( null, extractedExtensionPath );

        await zip.close();

        return extractedExtensionPath;
    }
    
    uninstall( extensionPath: string ) {
        fs.rmSync( extensionPath, { recursive: true, force: true } );
    }

    async validateExtensionZip( zipFilePath: string ): Promise< boolean > {

        const zip = new StreamZip.async({ file: zipFilePath });

        const entries = await zip.entries();

        for ( const entry of Object.values(entries) ) {

            if ( entry.name === 'manifest.json' ) {
                await zip.close();
                return true;
            }
        }

        return false;
    }
}