import { ProfileRepository } from "../../../domain/profile/profile.repository";
import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";


export type GetActiveSettingsPreset_Input = {
    profile_id: string;
}


export class GetActiveSettingsPresetUseCase {

    constructor(        
        public profileRepo: ProfileRepository,
    ) {}

    async execute( { profile_id }: GetActiveSettingsPreset_Input ): Promise< SettingsPreset | null > {
        
        const profile = await this.profileRepo.findOne({
            id: profile_id
        });

        if ( !profile )
            return null;
        
        const { active_settings_preset } = profile;
                

        return active_settings_preset || null;
    }   
}