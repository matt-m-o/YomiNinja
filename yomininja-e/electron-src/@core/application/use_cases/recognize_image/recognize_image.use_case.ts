import { Language } from "../../../domain/language/language";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { Profile } from "../../../domain/profile/profile";
import { ProfileRepository } from "../../../domain/profile/profile.repository";
import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { ImageProcessingAdapter } from "../../adapters/image_processing.adapter";
import { OcrAdapter } from "../../adapters/ocr.adapter";


export type RecognizeImageInput = {    
    imageBuffer: Buffer;
    profileId: string;
}

export class RecognizeImageUseCase {

    constructor(
        public ocrAdapters: OcrAdapter[],
        public imageProcessing: ImageProcessingAdapter,
        public profileRepo: ProfileRepository,
    ) {}

    async execute( input: RecognizeImageInput ): Promise< OcrResultScalable | null > {
        
        let activeSettingsPreset: SettingsPreset | null = null;
        let activeOcrLanguage: Language | null = null;

        const profile: Profile | null = await this.profileRepo.findOne({
            id: input.profileId
        });

        activeOcrLanguage = profile?.active_ocr_language || null;
        activeSettingsPreset = profile?.active_settings_preset || null;        
        
        if ( 
            !profile ||
            !activeOcrLanguage ||
            !activeSettingsPreset
        )
            return null;
            
        const ocrAdapter = this.getAdapter( activeSettingsPreset.ocr_engine.ocr_adapter_name );

        if ( !ocrAdapter )
            return null;
        
        const {
            image_scaling_factor,
            invert_colors
        } = activeSettingsPreset.ocr_engine;

        let imageBuffer: Buffer = input.imageBuffer;

        if ( image_scaling_factor != 1 ) {
            
            imageBuffer = ( await this.imageProcessing.resize({
                imageBuffer: input.imageBuffer,
                scaling_factor: image_scaling_factor,
            })).resizedImage;
        }
        
        if ( invert_colors ) {
            imageBuffer = await this.imageProcessing.invertColors( imageBuffer );
        }

        const ocrResult = await ocrAdapter.recognize({
            imageBuffer,
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