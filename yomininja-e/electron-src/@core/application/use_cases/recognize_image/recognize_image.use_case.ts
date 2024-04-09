import { Language } from "../../../domain/language/language";
import { OcrResult } from "../../../domain/ocr_result/ocr_result";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { OcrTemplate } from "../../../domain/ocr_template/ocr_template";
import { Profile } from "../../../domain/profile/profile";
import { ProfileRepository } from "../../../domain/profile/profile.repository";
import { OcrEngineSettings, SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { ImageProcessingAdapter } from "../../adapters/image_processing.adapter";
import { OcrAdapter } from "../../adapters/ocr.adapter";
import { VideoAnalyzerAdapter } from "../../adapters/video_analyzer.adapter";


export type RecognizeImageInput = {    
    imageBuffer: Buffer;
    profileId: string;
    ocrAdapterName?: string;
    autoMode?: boolean;
}

export class RecognizeImageUseCase< TOcrSettings extends OcrEngineSettings > {

    private regionIsStable = false;
    private previousResult: OcrResultScalable;

    constructor(
        public ocrAdapters: OcrAdapter< TOcrSettings >[],
        public imageProcessing: ImageProcessingAdapter,
        public profileRepo: ProfileRepository,
        public videoAnalyzer: VideoAnalyzerAdapter,
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
        
        let ocrAdapter = this.getAdapter( input.ocrAdapterName );

        if ( !ocrAdapter )
            ocrAdapter = this.getAdapter( profile.selected_ocr_adapter_name );

        if ( !ocrAdapter )
            return null;
        
        const ocrSettings = activeSettingsPreset.getOcrEngineSettings( ocrAdapter.name );
        
        if ( !ocrSettings ) return null;
        
        const {
            image_scaling_factor,
            invert_colors
        } = ocrSettings;

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
                language: profile.active_ocr_language,
                ocrAdapter,
                template: profile.active_ocr_template,
                autoMode: input.autoMode || false
            });
        }
        
        const ocrResult = await ocrAdapter.recognize({
            imageBuffer,
            language: profile.active_ocr_language,
        });

        if ( !ocrResult )
            return null;

        return ocrResult;
    }

    private async recognizeWithTemplate(
        input: {
            image: Buffer,
            template: OcrTemplate,
            ocrAdapter: OcrAdapter< TOcrSettings >,
            language: Language,
            autoMode: boolean;
        }
    ): Promise< OcrResultScalable > {

        const { image, template, ocrAdapter, language: languageCode } = input;

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

            const { auto_ocr_options } = targetRegion;

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

            if ( input.autoMode && auto_ocr_options.enabled ) {
                const motionResult = await this.videoAnalyzer.detectMotion({
                    videoFrame: regionImage,
                    streamId: targetRegion.id
                });

                const motionThreshold = (
                    ( (1 - auto_ocr_options.motion_sensitivity) / 10 ) *
                    (
                        targetRegionPixels.size.width *
                        targetRegionPixels.size.height *
                        255
                    )
                );
    
                console.log({
                    motionPixelsCount: motionResult.motionPixelsCount,
                    motionThreshold,
                    width: targetRegionPixels.size.width,
                    height: targetRegionPixels.size.height,
                });
    
    
                if ( motionResult.motionPixelsCount > motionThreshold ) {
                    this.regionIsStable = false;
                    console.log({
                        regionIsStable: this.regionIsStable,
                    });
                    continue;
                }
                else if (
                    motionResult.motionPixelsCount < motionThreshold &&
                    !this.regionIsStable
                ) {
                    this.regionIsStable = true;
                }
                else {
                    return this.previousResult;
                    // continue;
                }
    
                console.log({
                    regionIsStable: this.regionIsStable,
                });
            }
            

            const regionResult = await ocrAdapter.recognize({
                    imageBuffer: regionImage,
                    language: languageCode,
                })
                .catch( console.error );

            if ( !regionResult ) continue;

            if ( result.id === 0 )
                result.id = regionResult.id;

            
            // const regionResultScalable = OcrResultScalable.createFromOcrResult( regionResult );

            result.addRegionResult({
                regionId: targetRegion?.id,
                regionResult,
                regionPosition: targetRegion.position,
                regionSize: targetRegion.size,
                globalScaling: false,
            });
        }

        this.previousResult = result;

        return result;
    }

    private getAdapter( adapterName?: string ): OcrAdapter< TOcrSettings > | null {

        let adapter: OcrAdapter< TOcrSettings > | null = null;

        if ( adapterName )
            adapter = this.ocrAdapters.find( adapter => adapter.name === adapterName ) || null;

        // if ( !adapter )
        //     adapter = this.ocrAdapters?.[0] || null;

        return adapter;
    }

    getSupportedOcrEngines(): string[] {
        return this.ocrAdapters.map( adapter => adapter.name );
    }
}