import path from "path";
import fs from "fs"
import StreamZip, { StreamZipAsync } from "node-stream-zip";
import { applyYomiWorkaround } from "./workarounds/yomi_workaround";


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

        await this.applyWorkarounds( extractedExtensionPath );

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

    async applyWorkarounds( extensionPath: string ) {

        const name = ( await this.handleManifestJson( extensionPath ) )
            .name.toLowerCase();

        const isYomiExtension = [ 'yomitan', 'yomichan' ]
            .some( yomiName => name.includes( yomiName ) );

        if ( isYomiExtension )
            return applyYomiWorkaround( extensionPath );

    }


    async handleManifestJson( extensionPath: string ): Promise< chrome.runtime.Manifest > {

        const filePath = path.join( extensionPath, '/manifest.json' );

        const fileContent = fs.readFileSync( filePath, 'utf8' );

        const manifest = this.parseManifestJson(
            JSON.parse( fileContent ) 
        );

        fs.writeFileSync( filePath, JSON.stringify( manifest, null, '\t' ) );

        return manifest;
    }

    parseManifestJson( manifest: chrome.runtime.Manifest ): chrome.runtime.Manifest {

        if (
            manifest?.browser_action &&
            !manifest?.action
        ) 
            return manifest;

        manifest =  {
            ...manifest,
            browser_action: manifest.action,
            action: undefined,
        };

        return manifest;
    }
}