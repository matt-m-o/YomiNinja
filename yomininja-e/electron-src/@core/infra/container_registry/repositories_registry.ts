import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { SettingsPresetInMemoryRepository } from "../db/in_memory/settings_preset/settings_preset.in_memory.repository";
import SettingsPresetTypeOrmRepository from "../db/typeorm/settings_preset/settings_preset.typeorm.repository";
import { get_DictionaryDataSource, get_MainDataSource } from "./db_registry";
import { SettingsPreset } from "../../domain/settings_preset/settings_preset";
import LanguageTypeOrmRepository from "../db/typeorm/language/language.typeorm.repository";
import { Language } from "../../domain/language/language";
import ProfileTypeOrmRepository from "../db/typeorm/profile/profile.typeorm.repository";
import { Profile } from "../../domain/profile/profile";
import DictionaryTypeOrmRepository from "../db/typeorm/dictionary/dictionary.typeorm.repository";
import { Dictionary } from "../../domain/dictionary/dictionary";
import DictionaryTagTypeOrmRepository from "../db/typeorm/dictionary/dictionary_tag/dictionary_tag.typeorm.repository";
import { DictionaryTag } from "../../domain/dictionary/dictionary_tag/dictionary_tag";
import DictionaryDefinitionTypeOrmRepository from "../db/typeorm/dictionary/dictionary_definition/dictionary_definition.typeorm.repository";
import { DictionaryDefinition } from "../../domain/dictionary/dictionary_definition/dictionary_definition";
import DictionaryHeadwordTypeOrmRepository from "../db/typeorm/dictionary/dictionary_headword/dictionary_headword.typeorm.repository";
import { DictionaryHeadword } from "../../domain/dictionary/dictionary_headword/dictionary_headword";
import OcrTemplateTypeOrmRepository from "../db/typeorm/ocr_template/ocr_template.typeorm.repository";
import { OcrTemplate } from "../../domain/ocr_template/ocr_template";
import OcrTargetRegionTypeOrmRepository from "../db/typeorm/ocr_template/ocr_target_region/ocr_target_region.typeorm.repository";
import { OcrTargetRegion } from "../../domain/ocr_template/ocr_target_region/ocr_target_region";
import BrowserExtensionTypeOrmRepository from "../db/typeorm/browser_extension/browser_extension.typeorm.repository";
import { BrowserExtension } from "../../domain/browser_extension/browser_extension";


container_registry.bind( Registry.SettingsPresetInMemoryRepository )
    .toDynamicValue( (context) => {
        return new SettingsPresetInMemoryRepository();
    })
    .inSingletonScope();


container_registry.bind( Registry.SettingsPresetTypeOrmRepository )
    .toDynamicValue( (context) => {
        return new SettingsPresetTypeOrmRepository(
            get_MainDataSource().getRepository( SettingsPreset )
        );
    })
    .inSingletonScope();


container_registry.bind( Registry.LanguageTypeOrmRepository )
    .toDynamicValue( (context) => {
        return new LanguageTypeOrmRepository(
            get_MainDataSource().getRepository( Language )
        );
    })
    .inSingletonScope();


container_registry.bind( Registry.ProfileTypeOrmRepository )
    .toDynamicValue( (context) => {
        return new ProfileTypeOrmRepository(
            get_MainDataSource().getRepository( Profile )
        );
    })
    .inSingletonScope();


container_registry.bind( Registry.OcrTemplateTypeOrmRepository )
    .toDynamicValue( (context) => {
        return new OcrTemplateTypeOrmRepository(
            get_MainDataSource().getRepository( OcrTemplate ),
            get_MainDataSource().getRepository( OcrTargetRegion )
        );
    })
    .inSingletonScope();


container_registry.bind( Registry.OcrTargetRegionTypeOrmRepository )
    .toDynamicValue( (context) => {
        return new OcrTargetRegionTypeOrmRepository(
            get_MainDataSource().getRepository( OcrTargetRegion )
        );
    })
    .inSingletonScope();


container_registry.bind( Registry.BrowserExtensionTypeOrmRepository )
    .toDynamicValue( context => {
        return new BrowserExtensionTypeOrmRepository(
            get_MainDataSource().getRepository( BrowserExtension )
        );
    })
    .inSingletonScope();




// Dictionaries 

container_registry.bind( Registry.DictionaryTypeOrmRepository )
    .toDynamicValue( (context) => {
        return new DictionaryTypeOrmRepository(
            get_DictionaryDataSource().getRepository( Dictionary )
        );
    })
    .inSingletonScope();


container_registry.bind( Registry.DictionaryTagTypeOrmRepository )
    .toDynamicValue( (context) => {
        return new DictionaryTagTypeOrmRepository(
            get_DictionaryDataSource().getRepository( DictionaryTag )
        );
    })
    .inSingletonScope();


container_registry.bind( Registry.DictionaryDefinitionTypeOrmRepository )
    .toDynamicValue( (context) => {
        return new DictionaryDefinitionTypeOrmRepository(
            get_DictionaryDataSource().getRepository( DictionaryDefinition )
        );
    })
    .inSingletonScope();


container_registry.bind( Registry.DictionaryHeadwordTypeOrmRepository )
    .toDynamicValue( (context) => {
        return new DictionaryHeadwordTypeOrmRepository(
            get_DictionaryDataSource().getRepository( DictionaryHeadword )
        );
    })
    .inSingletonScope();

    


export function get_SettingsPresetRepository(): SettingsPresetTypeOrmRepository {    
    return container_registry.get< SettingsPresetTypeOrmRepository >( Registry.SettingsPresetTypeOrmRepository );
}

export function get_LanguageRepository(): LanguageTypeOrmRepository {    
    return container_registry.get< LanguageTypeOrmRepository >( Registry.LanguageTypeOrmRepository );
}

export function get_ProfileRepository(): ProfileTypeOrmRepository {    
    return container_registry.get< ProfileTypeOrmRepository >( Registry.ProfileTypeOrmRepository );
}


export function get_DictionaryRepository(): DictionaryTypeOrmRepository {    
    return container_registry.get< DictionaryTypeOrmRepository >( Registry.DictionaryTypeOrmRepository );
}

export function get_DictionaryTagRepository(): DictionaryTagTypeOrmRepository {    
    return container_registry.get< DictionaryTagTypeOrmRepository >( Registry.DictionaryTagTypeOrmRepository );
}

export function get_DictionaryDefinitionRepository(): DictionaryDefinitionTypeOrmRepository {    
    return container_registry.get< DictionaryDefinitionTypeOrmRepository >( Registry.DictionaryDefinitionTypeOrmRepository );
}

export function get_DictionaryHeadwordRepository(): DictionaryHeadwordTypeOrmRepository {    
    return container_registry.get< DictionaryHeadwordTypeOrmRepository >( Registry.DictionaryHeadwordTypeOrmRepository );
}

export function get_OcrTemplateRepository(): OcrTemplateTypeOrmRepository {    
    return container_registry.get< OcrTemplateTypeOrmRepository >( Registry.OcrTemplateTypeOrmRepository );
}

export function get_OcrTargetRegionRepository(): OcrTargetRegionTypeOrmRepository {    
    return container_registry.get< OcrTargetRegionTypeOrmRepository >( Registry.OcrTargetRegionTypeOrmRepository );
}