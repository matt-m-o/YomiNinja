import { Profile } from "./profile";

export type ProfileFindOneInput = {
    id?: string;
    name?: string;
}

export interface ProfileRepository {

    insert( profile: Profile ): Promise< void >;

    update( profile: Profile ): Promise< void >;

    findOne( input: ProfileFindOneInput ): Promise< Profile | null >;

    getAll(): Promise< Profile[] >;

    delete( id: string ): Promise< void >;
}