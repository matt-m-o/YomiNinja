import { BrowserExtensionManager } from "./browser_extension_manager";
import fs from 'fs';


describe( 'BrowserExtensionManager', () => {

    let browserExtensionManager: BrowserExtensionManager;

    const extensionZipPath = './data/extension-test.zip';

    beforeAll( () => {
        browserExtensionManager = new BrowserExtensionManager({ extensionsPath: './data/extensions' });
    });

    it('should install a browser extension', async () => {

        const extensionDirectory = await browserExtensionManager.install( extensionZipPath );

        const extensionsDirectories = fs.readdirSync( browserExtensionManager.extensionsPath );
        expect( extensionsDirectories.includes( 'extension-test' ) ).toBeTruthy();

        const extensionFiles = fs.readdirSync( extensionDirectory );
        expect( extensionFiles.includes( 'manifest.json' ) ).toBeTruthy();
    });


    it('should uninstall a browser extension', async () => {

        const extensionDirectory = await browserExtensionManager.install( extensionZipPath );

        browserExtensionManager.uninstall( extensionDirectory );
        
        const extensionsDirectories = fs.readdirSync( browserExtensionManager.extensionsPath );
        
        expect( extensionsDirectories.includes( 'extension-test' ) ).toBeFalsy();
    });
});