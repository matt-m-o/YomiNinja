import { Repository } from "typeorm";
import { SettingsPresetFindOneInput, SettingsPresetRepository } from "../../../../domain/settings_preset/settings_preset.repository";
import { SettingsPreset } from "../../../../domain/settings_preset/settings_preset";



export default class SettingsPresetTypeOrmRepository implements SettingsPresetRepository {

    constructor ( private ormRepo: Repository< SettingsPreset > ) {}

    async insert( preset: SettingsPreset ): Promise<void> {
        await this.ormRepo.save( preset );
    }
    async update( preset: SettingsPreset ): Promise<void> {
        await this.ormRepo.save( preset );
    }
    async findOne( params: SettingsPresetFindOneInput ): Promise< SettingsPreset | null > {
        return this.ormRepo.findOneBy( params );
    }
    async getAll(): Promise< SettingsPreset[] > {
        return this.ormRepo.find();
    }

    async delete(id: string): Promise<void> {
        await this.ormRepo.delete( { id } );
    }
}