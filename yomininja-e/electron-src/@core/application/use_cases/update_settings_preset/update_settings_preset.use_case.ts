import { SettingsPreset, SettingsPresetJson } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetRepository } from "../../../domain/settings_preset/settings_preset.repository";
import { OcrAdapter } from "../../adapters/ocr.adapter";

export interface UpdateSettingsPreset_Input extends SettingsPresetJson {
    options?: {
        restartOcrEngine?: boolean;
    };
}

export class UpdateSettingsPresetUseCase {

    constructor(
        public settingsPresetRepo: SettingsPresetRepository,
        public ocrAdapter: OcrAdapter,
    ) {}

    async execute( input: UpdateSettingsPreset_Input ): Promise< UpdateSettingsPreset_Output > {

        const { options } = input;

        const output: UpdateSettingsPreset_Output = {
            restartOcrAdapter: false,
        };

        const settingsPreset = await this.settingsPresetRepo.findOne({ id: input.id });        

        if ( !settingsPreset )
            return output;

        // Settings that directly impacts the ocr adapter
        if ( 
            settingsPreset.ocr_engine.cpu_threads != input.ocr_engine.cpu_threads ||
            settingsPreset.ocr_engine.max_image_width != input.ocr_engine.max_image_width ||
            settingsPreset.ocr_engine.inference_runtime != input.ocr_engine.inference_runtime
        )
            output.restartOcrAdapter = true;

        settingsPreset.name = input.name;
        settingsPreset.updateOverlaySettings( input.overlay );
        settingsPreset.updateOcrEngineSettings( input.ocr_engine );
        settingsPreset.updateDictionarySettings( input.dictionary )

        
        await this.settingsPresetRepo.update( settingsPreset );


        if ( output.restartOcrAdapter || options?.restartOcrEngine ) {
            output.restartOcrAdapter = await this.ocrAdapter.updateSettings( settingsPreset.ocr_engine );
        }
        
        if ( options?.restartOcrEngine ) {
            await new Promise( resolve => setTimeout( resolve, 500 ) );
            await new Promise( resolve => this.ocrAdapter.restart( () => resolve(null) ) );
        }

        return output;
    }
}

type UpdateSettingsPreset_Output = {
    restartOcrAdapter: boolean;
}