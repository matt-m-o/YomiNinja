import { Language } from "../../../domain/language/language";
import { OcrResult } from "../../../domain/ocr_result/ocr_result";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { OcrTemplate } from "../../../domain/ocr_template/ocr_template";
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

        if ( profile.active_ocr_template ) {

            return await this.recognizeWithTemplate({
                image: imageBuffer,
                languageCode: profile.active_ocr_language.two_letter_code,
                ocrAdapter,
                template: profile.active_ocr_template,
            });
        }
        
        const ocrResult = await ocrAdapter.recognize({
            imageBuffer,
            languageCode: profile.active_ocr_language.two_letter_code,
        });

        if ( !ocrResult )
            return null;

        return OcrResultScalable.createFromOcrResult( ocrResult );
    }

    private async recognizeWithTemplate(
        input: {
            image: Buffer,
            template: OcrTemplate,
            ocrAdapter: OcrAdapter,
            languageCode: string,
        }
    ): Promise< OcrResultScalable > {

        const { image, template, ocrAdapter, languageCode } = input;

        const { target_regions } = template;

        const metadata = await this.imageProcessing.getMetadata(image);

        const result = OcrResultScalable.create({
            id: 0,
            context_resolution: {
                width: metadata.width,
                height: metadata.height,
            }
        });

        for( const targetRegion of target_regions ) {

            const targetRegionPixels = targetRegion.toPixels({
                width: metadata.width,
                height: metadata.height,
            });

            // console.log( targetRegionPixels );

            const regionImage = await this.imageProcessing.extract({
                image,
                position: targetRegionPixels.position,
                size: targetRegionPixels.size,
            });

            const regionResult = await ocrAdapter.recognize({
                imageBuffer: regionImage,
                languageCode,
            })
                .catch( console.error );

            if ( !regionResult ) continue;

            if ( result.id === 0 )
                result.id = regionResult.id;

            
            const regionResultScalable = OcrResultScalable.createFromOcrResult( regionResult );

            result.addRegionResult({
                regionResult: regionResultScalable,
                regionPosition: targetRegion.position,
                regionSize: targetRegion.size,
                globalScaling: false,
            });
        }

        return result;
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