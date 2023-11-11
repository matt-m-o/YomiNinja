import "reflect-metadata";
import { DataSource } from 'typeorm';
import { Registry, container_registry } from "./container_registry";
import { dictionaryDataSourceOptions, mainDataSourceOptions } from "../db/typeorm/data_source";



container_registry.bind( Registry.MainDataSource )
    .toDynamicValue( (context) => {
        return new DataSource( mainDataSourceOptions );
    })
    .inSingletonScope();


container_registry.bind( Registry.DictionaryDataSource )
    .toDynamicValue( (context) => {
        return new DataSource( dictionaryDataSourceOptions );
    })
    .inSingletonScope();


export function get_MainDataSource(): DataSource {
    return container_registry.get< DataSource >( Registry.MainDataSource );
}


export function get_DictionaryDataSource(): DataSource {
    return container_registry.get< DataSource >( Registry.DictionaryDataSource );
}