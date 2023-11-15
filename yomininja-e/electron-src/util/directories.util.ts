import isDev from "electron-is-dev";
import { join } from "path";

// import '../../'

export const ROOT_DIR = isDev ?
    join( __dirname, '../../' ) :
    join( __dirname, '../../../' );

export const PAGES_DIR = join( ROOT_DIR, '/renderer/out' ); // Only for production
export const BIN_DIR = join( ROOT_DIR, '../../bin' ); // Only for development


export const EXTENSIONS_DIR = isDev ?
    join( __dirname, '../../../extensions' ) :
    join( process.resourcesPath, '/extensions' );

console.log({
    ROOT_DIR,
    PAGES_DIR,
    BIN_DIR,
    EXTENSIONS_DIR
})
    