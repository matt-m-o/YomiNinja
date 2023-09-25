import { Repository } from "typeorm";
import { ProfileFindOneInput, ProfileRepository } from "../../../../domain/profile/profile.repository";
import { Profile } from "../../../../domain/profile/profile";


export default class ProfileTypeOrmRepository implements ProfileRepository {

    constructor ( private ormRepo: Repository< Profile > ) {}

    async insert( profile: Profile ): Promise<void> {
        await this.ormRepo.save( profile );
    }
    async update( profile: Profile ): Promise<void> {
        await this.ormRepo.save( profile );
    }
    async findOne( params: ProfileFindOneInput ): Promise< Profile | null > {
        return this.ormRepo.findOne({
            where: params,
            relations: ['active_settings_preset']
        });
    }
    async getAll(): Promise< Profile[] > {
        return this.ormRepo.find({
            relations: ['active_settings_preset'],
        });
    }

    async delete(id: string): Promise<void> {
        await this.ormRepo.delete( { id } );
    }
}