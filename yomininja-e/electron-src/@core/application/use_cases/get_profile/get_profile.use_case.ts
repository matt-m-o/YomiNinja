import { Profile } from "../../../domain/profile/profile";
import { ProfileRepository } from "../../../domain/profile/profile.repository";


export type GetProfile_Input = {
    profileId: string;
}


export class GetProfileUseCase {

    constructor(        
        public profileRepo: ProfileRepository,
    ) {}

    async execute( { profileId: profile_id }: GetProfile_Input ): Promise< Profile | null > {
        
        const profile = await this.profileRepo.findOne({
            id: profile_id
        });

        if ( !profile )
            return null;                    

        return profile;
    }   
}