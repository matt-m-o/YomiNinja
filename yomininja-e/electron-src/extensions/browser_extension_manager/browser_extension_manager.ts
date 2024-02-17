import path from "path";
import fs from "fs"
import StreamZip, { StreamZipAsync } from "node-stream-zip";
import { applyYomiWorkaround } from "./workarounds/yomi_workaround";


export class BrowserExtensionManager {

    userExtensionsPath: string;
    builtinExtensionsPath: string;
    isDev: boolean;

    constructor( input?: {
        userExtensionsPath?: string;
        builtinExtensionsPath?: string;
        isDev?: boolean;
    }) {

        this.userExtensionsPath = input?.userExtensionsPath || './extensions';
        this.builtinExtensionsPath = input?.builtinExtensionsPath || './extensions';
        this.isDev = input?.isDev || true;
    }


    async installZip( zipFilePath: string ): Promise< string > {

        const isValid = await this.validateExtensionZip( zipFilePath );

        if ( !isValid )
            throw new Error('invalid-extension');
        
        const fileName = path.basename( zipFilePath ).split('.zip')[0];

        console.log(`Installing ${fileName}`);
            
        const extractedExtensionPath = path.join( this.userExtensionsPath, fileName );

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

    async installBuiltinExtensions() {

        const files = fs.readdirSync( this.builtinExtensionsPath );
        
        for ( const fileName of files ) {

            if ( !fileName.includes('.zip') ) continue;

            const zipFilePath = path.join( this.builtinExtensionsPath, fileName );

            try {

                await this.installZip( zipFilePath );

                if ( !this.isDev )
                    fs.rmSync( zipFilePath );

            } catch (error) {
                console.error(error);
            }

        }
    }
}