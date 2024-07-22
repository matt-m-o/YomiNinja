import { app } from "electron";
import isDev from "electron-is-dev";
import { join } from "path";

// import '../../'

export const ROOT_DIR = isDev ?
    join( __dirname, '../../' ) :
    join( __dirname, '../../../' );

export const PAGES_DIR = join( ROOT_DIR, '/renderer/out' ); // Only for production
export const BIN_DIR = join( ROOT_DIR, '../../bin' ); // Only for development

export const BUILTIN_EXTENSIONS_DIR = isDev ?
    join( __dirname, '../../../extensions' ) :
    join( process.resourcesPath, '/extensions' );

export const USER_DATA_DIR = isDev ?
    join( __dirname, '../../../data' ) :
    app.getPath('userData');

export const USER_EXTENSIONS_DIR = isDev ?
    join( __dirname, '../../../data/extensions' ) :
    join( app.getPath('userData'), '/extensions' );


export const ICONS_DIR = isDev ?
    join( __dirname, '../../../electron_resources' ) :
    process.resourcesPath;

console.log({
    ROOT_DIR,
    PAGES_DIR,
    BIN_DIR,
    EXTENSIONS_DIR: USER_EXTENSIONS_DIR,
    USER_DATA_DIR,
    ICONS_DIR
})
    