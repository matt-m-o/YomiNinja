import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { SettingsPresetTypeOrmSchema } from './settings_preset/settings_preset.schema';
import { LanguageTypeOrmSchema } from './language/language.schema';
import { ProfileTypeOrmSchema } from './profile/profile.schema';
import { DictionaryTypeOrmSchema } from './dictionary/dictionary.schema';
import { DictionaryTagTypeOrmSchema } from './dictionary/dictionary_tag/dictionary_tag.schema';
import { DictionaryDefinitionTypeOrmSchema } from './dictionary/dictionary_definition/dictionary_definition.schema';
import { DictionaryHeadwordTypeOrmSchema } from './dictionary/dictionary_headword/dictionary_headword.schema';

// Mainly for application settings
export const mainDataSourceOptions: DataSourceOptions = {
    type: 'sqlite',    
    synchronize: true,
    database: join( './data/main.db' ),
    logging: false,
    entities: [        
        SettingsPresetTypeOrmSchema,
        LanguageTypeOrmSchema,
        ProfileTypeOrmSchema
    ],
    // entities: [ './main/electron-src/@core/infra/db/typeorm/**/*.schema.js' ],
    // migrations: [ './main/electron-src/@core/infra/db/typeorm/migrations/*.js' ],
}

// DataSource for dictionaries
export const dictionaryDataSourceOptions: DataSourceOptions = {
    type: 'sqlite',
    synchronize: true,
    database: join( './data/dict.db' ), // :memory: | join( './data/dict.db' )
    logging: false,
    enableWAL: true,
    entities: [
        DictionaryTypeOrmSchema,
        DictionaryTagTypeOrmSchema,
        DictionaryDefinitionTypeOrmSchema,
        DictionaryHeadwordTypeOrmSchema
    ],
    // entities: [ './main/electron-src/@core/infra/db/typeorm/**/*.schema.js' ],
    // migrations: [ './main/electron-src/@core/infra/db/typeorm/migrations/*.js' ],
}