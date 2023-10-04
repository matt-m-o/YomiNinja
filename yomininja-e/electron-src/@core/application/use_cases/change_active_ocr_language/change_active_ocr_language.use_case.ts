import { Language } from "../../../domain/language/language";
import { LanguageRepository } from "../../../domain/language/language.repository";
import { Profile } from "../../../domain/profile/profile";
import { ProfileRepository } from "../../../domain/profile/profile.repository";


export type ChangeActiveLanguage_Input = {    
    languageCode: string; // Two letters
    profileId: string;
}

export class ChangeActiveOcrLanguageUseCase {

    constructor(
        private profileRepo: ProfileRepository,
        private languageRepo: LanguageRepository,
    ) {}

    async execute( input: ChangeActiveLanguage_Input ): Promise< void > {
                
        const selectedLanguage: Language | null = await this.languageRepo.findOne({
            two_letter_code: input.languageCode,
        });

        if ( !selectedLanguage )
            return;

        const profile: Profile | null = await this.profileRepo.findOne({
            id: input.profileId
        });
        
        if ( !profile )
            return;
        
        profile.active_ocr_language = selectedLanguage;

        await this.profileRepo.update( profile );
    }
}