import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { SettingsPresetInMemoryRepository } from "../db/in_memory/settings_preset/settings_preset.in_memory.repository";
import SettingsPresetTypeOrmRepository from "../db/typeorm/settings_preset/settings_preset.typeorm.repository";
import { get_MainDataSource } from "./db_registry";
import { SettingsPreset } from "../../domain/settings_preset/settings_preset";
import { DataSource } from 'typeorm'
import LanguageTypeOrmRepository from "../db/typeorm/language/language.typeorm.repository";
import { Language } from "../../domain/language/language";
import ProfileTypeOrmRepository from "../db/typeorm/profile/profile.typeorm.repository";
import { Profile } from "../../domain/profile/profile";


container_registry.bind( Registry.SettingsPresetInMemoryRepository ).toDynamicValue( (context) => {
    return new SettingsPresetInMemoryRepository();
}).inSingletonScope();


container_registry.bind( Registry.SettingsPresetTypeOrmRepository ).toDynamicValue( (context) => {
    
    return new SettingsPresetTypeOrmRepository(
        get_MainDataSource().getRepository( SettingsPreset )
    );

}).inSingletonScope();

container_registry.bind( Registry.LanguageTypeOrmRepository ).toDynamicValue( (context) => {
    
    return new LanguageTypeOrmRepository(
        get_MainDataSource().getRepository( Language )
    );

}).inSingletonScope();

container_registry.bind( Registry.ProfileTypeOrmRepository ).toDynamicValue( (context) => {
    
    return new ProfileTypeOrmRepository(
        get_MainDataSource().getRepository( Profile )
    );

}).inSingletonScope();



export function get_SettingsPresetRepository(): SettingsPresetTypeOrmRepository {    
    return container_registry.get< SettingsPresetTypeOrmRepository >( Registry.SettingsPresetTypeOrmRepository );
}


export function get_LanguageRepository(): LanguageTypeOrmRepository {    
    return container_registry.get< LanguageTypeOrmRepository >( Registry.LanguageTypeOrmRepository );
}

export function get_ProfileRepository(): ProfileTypeOrmRepository {    
    return container_registry.get< ProfileTypeOrmRepository >( Registry.ProfileTypeOrmRepository );
}