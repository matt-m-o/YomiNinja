import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { SettingsPresetRepository } from "../../../domain/settings_preset/settings_preset.repository";
import { OcrAdapter } from "../../adapters/ocr.adapter";


export type RecognizeImageInput = {    
    imageBuffer: Buffer;    
    settingsPresetId: string;
}

export class RecognizeImageUseCase {

    constructor(
        public ocrAdapters: OcrAdapter[],
        public settingsPresetRepository: SettingsPresetRepository,
    ) {}

    async execute( input: RecognizeImageInput ): Promise< OcrResultScalable | null > {

        const settings = await this.settingsPresetRepository.findOne({
            id: input.settingsPresetId
        });
        
        if (!settings)
            return null;

        const adapter = this.getAdapter( settings.ocr_adapter_name );

        if ( !adapter )
            return null;

        const ocrResult = await adapter.recognize({            
            imageBuffer: input.imageBuffer,
            languageCode: settings.language_code,
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