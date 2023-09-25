import { DataSourceOptions } from 'typeorm';
import { join } from 'path';

export const dataSourceOptions: DataSourceOptions = {
    type: 'sqlite',    
    synchronize: true,    
    database: join( __dirname, '../main.db' ),
    logging: false,
    entities: [ './main/electron-src/@core/infra/db/typeorm/**/*.schema.js' ],
    migrations: [ './main/electron-src/@core/infra/db/typeorm/migrations/*.js' ],
}