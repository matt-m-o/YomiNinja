import { Language } from "../../../domain/language/language";
import { LanguageRepository } from "../../../domain/language/language.repository";
import { OcrTemplate, OcrTemplateId } from "../../../domain/ocr_template/ocr_template";
import { OcrTemplateRepository } from "../../../domain/ocr_template/ocr_template.repository";
import { Profile } from "../../../domain/profile/profile";
import { ProfileRepository } from "../../../domain/profile/profile.repository";


export type ChangeActiveOcrTemplate_Input = {    
    ocrTemplateId: OcrTemplateId | null; // Two letters
    profileId: string;
}

export class ChangeActiveOcrTemplateUseCase {

    constructor(
        private profileRepo: ProfileRepository,
        private ocrTemplateRepo: OcrTemplateRepository,
    ) {}

    async execute( input: ChangeActiveOcrTemplate_Input ): Promise< void > {
                
        let ocrTemplate: OcrTemplate | null = null;

        if ( input?.ocrTemplateId ) {
            ocrTemplate = await this.ocrTemplateRepo.findOne({
                id: input.ocrTemplateId,
            });
        }

        const profile: Profile | null = await this.profileRepo.findOne({
            id: input.profileId
        });
        
        if ( !profile )
            return;
        
        profile.active_ocr_template = ocrTemplate;

        await this.profileRepo.update( profile );
    }
}