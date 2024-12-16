import fs from 'fs';
import { USER_DATA_DIR } from './directories.util';
import { join } from 'path';
import { app } from 'electron';

const userDataVersionPath = join(USER_DATA_DIR, 'yn_version.txt');

export function getUserDataVersion(): string | undefined {

    if ( !fs.existsSync(userDataVersionPath) ) return;

    const userDataVersion = fs.readFileSync( userDataVersionPath, 'utf8' );
    return userDataVersion;
}

export function updateUserDataVersion() {
    fs.writeFileSync( userDataVersionPath, app.getVersion(), 'utf-8' );
}

export function isUserDataCompatible(): boolean {
    const userDataVersion = getUserDataVersion();

    if ( userDataVersion !== app.getVersion() )
        return false
    
    return  true;
}

export function removeIncompatibleFiles() {
    // PaddleOCR v4 preset
    fs.rmSync(
        join( USER_DATA_DIR, '/ppocr' ),
        { recursive: true, force: true }
    );
    
    // Binaries
    fs.rmSync(
        join( USER_DATA_DIR, '/bin' ),
        { recursive: true, force: true }
    );
}