import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { SettingsPresetTypeOrmSchema } from './settings_preset/settings_preset.schema';
import { LanguageTypeOrmSchema } from './language/language.schema';
import { ProfileTypeOrmSchema } from './profile/profile.schema';
import { DictionaryTypeOrmSchema } from './dictionary/dictionary.schema';
import { DictionaryTagTypeOrmSchema } from './dictionary/dictionary_tag/dictionary_tag.schema';
import { DictionaryDefinitionTypeOrmSchema } from './dictionary/dictionary_definition/dictionary_definition.schema';
import { DictionaryHeadwordTypeOrmSchema } from './dictionary/dictionary_headword/dictionary_headword.schema';
import { OcrTemplateTypeOrmSchema } from './ocr_template/ocr_template.schema';
import { OcrTargetRegionTypeOrmSchema } from './ocr_template/ocr_target_region/ocr_target_region.schema';
import { USER_DATA_DIR } from '../../../../util/directories.util';
import { BrowserExtensionTypeOrmSchema } from './browser_extension/browser_extension.schema';

// Mainly for application settings
export const mainDataSourceOptions: DataSourceOptions = {
    type: 'sqlite',
    synchronize: true,
    database: join( USER_DATA_DIR, '/yn_databases/main.db' ),
    logging: false,
    entities: [
        SettingsPresetTypeOrmSchema,
        LanguageTypeOrmSchema,
        ProfileTypeOrmSchema,
        OcrTemplateTypeOrmSchema,
        OcrTargetRegionTypeOrmSchema,
        BrowserExtensionTypeOrmSchema
    ],
    // entities: [ './main/electron-src/@core/infra/db/typeorm/**/*.schema.js' ],
    // migrations: [ './main/electron-src/@core/infra/db/typeorm/migrations/*.js' ],
}

// DataSource for dictionaries
export const dictionaryDataSourceOptions: DataSourceOptions = {
    type: 'sqlite',
    synchronize: true,
    database: join( USER_DATA_DIR, './yn_databases/dict.db' ), // :memory: | join( './data/dict.db' )
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