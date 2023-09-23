import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { SettingsPresetInMemoryRepository } from "../db/in_memory/settings_preset/settings_preset.in_memory.repository";



container_registry.bind( Registry.SettingsPresetInMemoryRepository ).toDynamicValue( (context) => {
    return new SettingsPresetInMemoryRepository();
}).inSingletonScope();



export function get_SettingsPresetRepository(): SettingsPresetInMemoryRepository {    
    return container_registry.get< SettingsPresetInMemoryRepository >( Registry.SettingsPresetInMemoryRepository );
}