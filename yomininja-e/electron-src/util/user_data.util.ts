import fs from 'fs';
import { USER_DATA_DIR } from './directories.util';
import path, { join } from 'path';
import { app } from 'electron';
import { get_MainDataSource } from '../@core/infra/container_registry/db_registry';
import { pyOcrService } from '../@core/infra/ocr/ocr_services/py_ocr_service/_temp_index';

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

    if ( !pyOcrService.isPythonInstalled() )
        return false;
    
    return true;
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

export function updateUserDataStructure() {

    const oldDbDirPath = join( USER_DATA_DIR, '/databases' );
    const newDbPath = get_MainDataSource().options.database;

    if ( typeof newDbPath !== 'string' )
        return;

    const newDbDirPath = path.dirname( newDbPath );

    const oldDbPathExists = fs.existsSync( oldDbDirPath );

    // console.log({
    //     oldDbDirPath,
    //     newDbDirPath,
    //     oldDbPathExists
    // });

    if ( !oldDbPathExists )
        return;

    const files = fs.readdirSync( oldDbDirPath, { withFileTypes: true } );
    for ( const file of files ) {
        if ( file.name !== 'Lib' ) {
            fs.cpSync(
                join( file.parentPath, file.name ),
                join( newDbDirPath, file.name ),
                { recursive: true, force: false }
            )
        }
    }

    fs.existsSync( userDataVersionPath )
}