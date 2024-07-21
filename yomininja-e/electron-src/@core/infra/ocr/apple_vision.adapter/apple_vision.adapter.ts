import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { AppleVisionOcrEngineSettings, getAppleVisionDefaultSettings, appleVisionAdapterName } from "./apple_vision_settings";
import { appleVisionPyService } from "./apple_vision_py/_temp_index";

export class AppleVisionAdapter implements OcrAdapter< AppleVisionOcrEngineSettings > {
    
    static _name: string = appleVisionAdapterName;
    public readonly name: string = AppleVisionAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;
    private recognitionCallOnHold: OcrRecognitionInput | undefined;

    constructor() {}

    initialize() {
        this.status = OcrAdapterStatus.Enabled;
    }

    async recognize( input: OcrRecognitionInput ): Promise< OcrResultScalable | null > {
        
        if ( this.status === OcrAdapterStatus.Processing ) {
            this.recognitionCallOnHold = input;
            console.log('holding recognition input');
            return null;
        }
        else {
            this.recognitionCallOnHold = undefined;            
        }
        
        this.idCounter++;

        const { language } = input
      
        console.log('processing recognition input');
        this.status = OcrAdapterStatus.Processing;
        // console.time('AppleVisionAdapter.recognize');
        const result = await appleVisionPyService.recognize({
            id: this.idCounter.toString() + this.name,
            image: input.imageBuffer,
            languageCode: language.bcp47_tag || language.two_letter_code
        });
        // console.timeEnd('AppleVisionAdapter.recognize');
        this.status = OcrAdapterStatus.Enabled;
        
        // Throwing away current response an returning newest call result
        if ( this.recognitionCallOnHold ){
            return await this.recognize( this.recognitionCallOnHold );
        }

        if ( !result ) return null;

        return OcrResultScalable.createFromOcrResult(result);
    }

    async getSupportedLanguages(): Promise< string[] > {
        return ( await appleVisionPyService.getSupportedLanguages() );
    }

    async updateSettings (
        settingsUpdate: AppleVisionOcrEngineSettings,
        oldSettings?: AppleVisionOcrEngineSettings | undefined
    ): Promise< UpdateOcrAdapterSettingsOutput < AppleVisionOcrEngineSettings > > {
        return {
            settings: settingsUpdate,
            restart: false
        }
    }
    getDefaultSettings(): AppleVisionOcrEngineSettings {
        return getAppleVisionDefaultSettings()
    }
    getSettingsOptions(): OcrEngineSettingsOptions{
        throw new Error('AppleVisionAdapter.getSettingsOptions() not implemented');
    }
    restart( callback: () => void ): void {
    }

}
