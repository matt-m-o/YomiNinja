import { Language } from "../../../domain/language/language";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { Profile } from "../../../domain/profile/profile";
import { ProfileRepository } from "../../../domain/profile/profile.repository";
import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { OcrAdapter } from "../../adapters/ocr.adapter";


export type RecognizeImageInput = {    
    imageBuffer: Buffer;
    profile_id: string;
}

export class RecognizeImageUseCase {

    constructor(
        public ocrAdapters: OcrAdapter[],
        public profileRepo: ProfileRepository,
    ) {}

    async execute( input: RecognizeImageInput ): Promise< OcrResultScalable | null > {
        
        let activeSettingsPreset: SettingsPreset | null = null;
        let activeOcrLanguage: Language | null = null;

        const profile: Profile | null = await this.profileRepo.findOne({
            id: input.profile_id
        });

        activeOcrLanguage = profile?.active_ocr_language || null;
        activeSettingsPreset = profile?.active_settings_preset || null;        
        
        if ( 
            !profile ||
            !activeOcrLanguage ||
            !activeSettingsPreset
        )
            return null;
        

        const adapter = this.getAdapter( activeSettingsPreset.ocr_adapter_name );

        if ( !adapter )
            return null;

        const ocrResult = await adapter.recognize({            
            imageBuffer: input.imageBuffer,
            languageCode: profile.active_ocr_language.two_letter_code,
        });

        if ( !ocrResult )
            return null;

        return OcrResultScalable.createFromOcrResult( ocrResult );
    }

    private getAdapter( adapterName?: string ): OcrAdapter | null {

        let adapter: OcrAdapter | null = null;

        if ( adapterName )
            adapter = this.ocrAdapters.find( adapter => adapter.name === adapterName ) || null;

        if ( !adapter )
            adapter = this.ocrAdapters?.[0] || null;

        return adapter;
    }
}