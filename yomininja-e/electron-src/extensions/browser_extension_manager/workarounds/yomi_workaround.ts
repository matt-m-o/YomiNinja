import path from "path";
import fs from 'fs';


export function applyYomiWorkaround( extensionPath: string  ) {

    const permissionsUtilPath = path.join(
        extensionPath,
        '/js/data/permissions-util.js'
    );

    try {
        const fileContent = fs.readFileSync( permissionsUtilPath, 'utf-8' );

        const indexOfGetAllPermissions = fileContent.indexOf('getAllPermissions() {');

        if (indexOfGetAllPermissions === -1) {
            console.error('Function getAllPermissions() not found in the file.');
            return;
        }

        const contentBefore = fileContent.slice(
            0,
            indexOfGetAllPermissions +
            'getAllPermissions() {'.length
        );

        // Workaround
        const workaroundCode = `
        // YomiNinja workaround | Applied at ${Date.now()}
        return {
            "origins": [
                "<all_urls>",
                "chrome://favicon/*",
                "file:///*",
                "http://*/*",
                "https://*/*"
            ],
            "permissions": [
                "clipboardWrite",
                "storage",
                "unlimitedStorage",
                "webRequest",
                "webRequestBlocking"
            ]
        };`;

        const rest = fileContent.slice(
            indexOfGetAllPermissions + 'getAllPermissions() {'.length
        );

        const updatedFileContent = contentBefore + workaroundCode + rest;

        fs.writeFileSync( permissionsUtilPath, updatedFileContent, 'utf-8' );

        applyManifestV2Patch( extensionPath );

    } catch (error) {
        console.error(error);
    }
}

function applyManifestV2Patch( extensionPath: string ) {
    const backendFilePath = path.join(
        extensionPath,
        '/js/background/backend.js'
    );

    try {
        const fileContent = fs.readFileSync( backendFilePath, 'utf-8' );
        const updatedFileContent = fileContent.replaceAll('manifest.action', 'manifest.browser_action');
        fs.writeFileSync( backendFilePath, updatedFileContent, 'utf-8' );
    }
    catch (error) {
        console.error(error);
    }
}