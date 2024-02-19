import path from "path";
import fs from "fs"
import StreamZip, { StreamZipAsync } from "node-stream-zip";
import { applyYomiWorkaround } from "./workarounds/yomi_workaround";
import sanitize from 'sanitize-filename';

export class BrowserExtensionManager {

    userExtensionsPath: string;
    builtinExtensionsPath: string;
    isDev: boolean;

    constructor( input?: {
        userExtensionsPath?: string;
        builtinExtensionsPath?: string;
        isDev: boolean;
    }) {

        this.userExtensionsPath = input?.userExtensionsPath || './extensions';
        this.builtinExtensionsPath = input?.builtinExtensionsPath || './extensions';
        this.isDev = input?.isDev !== undefined ? input?.isDev : true;
    }


    async installZip( zipFilePath: string, overwrite = true ): Promise< string > {

        const isValid = await this.validateExtensionZip( zipFilePath );

        if ( !isValid )
            throw new Error('invalid-extension');
        
        const fileName = path.basename( zipFilePath ).split('.zip')[0];

        console.log(`Installing ${fileName}`);
            
        const extractedExtensionPath = path.join( this.userExtensionsPath, fileName );

        if ( !fs.existsSync( extractedExtensionPath ) )
            fs.mkdirSync( extractedExtensionPath, { recursive: true } );

        const zip = new StreamZip.async({ file: zipFilePath });

        const count = await zip.extract( null, extractedExtensionPath );

        await zip.close();

        const newPath = await this.renameExtensionDirectory(
            extractedExtensionPath, overwrite
        );

        if ( newPath === extractedExtensionPath ) {
            fs.rmSync( extractedExtensionPath, { recursive: true, force: true } );
            return '';
        }

        await this.applyWorkarounds( newPath );

        return newPath;
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


    async renameExtensionDirectory( extensionPath: string, overwrite = true ): Promise< string > {

        const manifest = await this.handleManifestJson( extensionPath );

        let author: string | undefined = undefined;

        if ( typeof manifest.author === 'string' )
            author = manifest.author;

        else if ( manifest?.author?.email )
            author = manifest.author.email;


        const newDir = sanitize(`${author}.${manifest.name}`);

        const newPath = path.join( path.dirname( extensionPath ), newDir );

        const newDirAlreadyExists = fs.existsSync( newPath );
        
        if ( newDirAlreadyExists && !overwrite )
            return extensionPath;

        else if ( newDirAlreadyExists )
            fs.rmSync( newPath, { recursive: true, force: true } );

        fs.renameSync( extensionPath, newPath );

        return newPath;
    }

    async installBuiltinExtensions() {

        const files = fs.readdirSync( this.builtinExtensionsPath );
        
        for ( const fileName of files ) {

            if ( !fileName.includes('.zip') ) continue;

            const zipFilePath = path.join( this.builtinExtensionsPath, fileName );

            try {

                await this.installZip( zipFilePath, false );

                if ( !this.isDev && !this.isAppImage() )
                    fs.rmSync( zipFilePath );

            } catch (error) {
                console.error(error);
            }

        }
    }

    isAppImage(): boolean {
        return Boolean( process.env.APPIMAGE );
    }
}