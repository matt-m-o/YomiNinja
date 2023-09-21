import { join } from "path";

export const PAGES_DIR = join( __dirname, '../../../renderer/out' );
export const BIN_DIR = join( __dirname, '../../../../bin' ); // Only for development