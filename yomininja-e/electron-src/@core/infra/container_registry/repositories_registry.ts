import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { SettingsPresetInMemoryRepository } from "../db/in_memory/settings_preset/settings_preset.in_memory.repository";
import SettingsPresetTypeOrmRepository from "../db/typeorm/settings_preset/settings_preset.typeorm.repository";
import { get_MainDataSource } from "./db_registry";
import { SettingsPreset } from "../../domain/settings_preset/settings_preset";
import { DataSource } from 'typeorm'


container_registry.bind( Registry.SettingsPresetInMemoryRepository ).toDynamicValue( (context) => {
    return new SettingsPresetInMemoryRepository();
}).inSingletonScope();


container_registry.bind( Registry.SettingsPresetTypeOrmRepository ).toDynamicValue( (context) => {
    
    return new SettingsPresetTypeOrmRepository(
        get_MainDataSource().getRepository( SettingsPreset )
    );

}).inSingletonScope();



export function get_SettingsPresetRepository(): SettingsPresetTypeOrmRepository {    
    return container_registry.get< SettingsPresetTypeOrmRepository >( Registry.SettingsPresetTypeOrmRepository );
}