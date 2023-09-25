import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetRepository } from "../../../domain/settings_preset/settings_preset.repository";
import { OcrAdapter } from "../../adapters/ocr.adapter";


export type RecognizeImageInput = {    
    imageBuffer: Buffer;    
    settingsPresetId?: string;
}

export class RecognizeImageUseCase {

    constructor(
        public ocrAdapters: OcrAdapter[],
        public settingsPresetRepository: SettingsPresetRepository,
    ) {}

    async execute( input: RecognizeImageInput ): Promise< OcrResultScalable | null > {

        
        let settingsPreset: SettingsPreset | null = null;

        if ( input.settingsPresetId ) {
            settingsPreset = await this.settingsPresetRepository.findOne({
                id: input.settingsPresetId
            });
        }
        
        if ( !settingsPreset ){
            settingsPreset = await this.settingsPresetRepository.findOne({
                name: SettingsPreset.default_name
            });
        }
        
        
        if (!settingsPreset)
            return null;
                

        const adapter = this.getAdapter( settingsPreset.ocr_adapter_name );

        if ( !adapter )
            return null;

        const ocrResult = await adapter.recognize({            
            imageBuffer: input.imageBuffer,
            languageCode: settingsPreset.language_code,
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