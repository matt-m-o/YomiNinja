import { OcrTemplate, OcrTemplateId } from "../../../domain/ocr_template/ocr_template";
import { OcrTemplateRepository } from "../../../domain/ocr_template/ocr_template.repository";
import { Profile } from "../../../domain/profile/profile";
import { ProfileRepository } from "../../../domain/profile/profile.repository";


export type ChangeSelectedOcrEngine_Input = {    
    ocrEngineAdapterName: string;
    profileId: string;
}

export class ChangeSelectedOcrEngineUseCase {

    private profilesRepo: ProfileRepository;

    constructor( input: {
        profilesRepo: ProfileRepository;
    }) {
        this.profilesRepo = input.profilesRepo;
    }

    async execute( input: ChangeSelectedOcrEngine_Input ): Promise< void > {

        const profile: Profile | null = await this.profilesRepo.findOne({
            id: input.profileId
        });
        
        if ( !profile ) return;
        
        profile.selected_ocr_adapter_name = input.ocrEngineAdapterName;

        await this.profilesRepo.update( profile );
    }
}