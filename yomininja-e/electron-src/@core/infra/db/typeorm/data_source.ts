import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { SettingsPresetTypeOrmSchema } from './settings_preset/settings_preset.schema';

// Mainly for application settings
export const mainDataSourceOptions: DataSourceOptions = {
    type: 'sqlite',    
    synchronize: true,
    database: join( './data/main.db' ),
    logging: false,
    entities: [
        SettingsPresetTypeOrmSchema
    ],
    // entities: [ './main/electron-src/@core/infra/db/typeorm/**/*.schema.js' ],
    // migrations: [ './main/electron-src/@core/infra/db/typeorm/migrations/*.js' ],
}

// DataSource for dictionaries
// export const dictionaryDataSourceOptions: DataSourceOptions = {
//     type: 'sqlite',    
//     synchronize: true,
//     database: join( './data/dict.db' ),
//     logging: false,
//     entities: [
//         // DictionaryTypeOrmSchema
//     ],    
// }