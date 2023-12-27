import { SettingsPreset, SettingsPresetJson } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetRepository } from "../../../domain/settings_preset/settings_preset.repository";
import { OcrAdapter } from "../../adapters/ocr.adapter";

export interface CreateSettingsPreset_Input extends Partial< Omit< SettingsPresetJson, 'id' > >{
}

export class CreateSettingsPresetUseCase {

    public settingsPresetRepo: SettingsPresetRepository;
    public ocrAdapter: OcrAdapter;

    constructor( input: {
        settingsPresetRepo: SettingsPresetRepository,
        ocrAdapter: OcrAdapter
    }) {
        this.settingsPresetRepo = input.settingsPresetRepo;
        this.ocrAdapter = input.ocrAdapter;
    }

    async execute( input?: CreateSettingsPreset_Input ): Promise< void > {

        if ( input ) {
            const foundSettingsPreset = await this.settingsPresetRepo.findOne({ name: input?.name });
            if ( foundSettingsPreset )
                return;
        }

        let settingsPreset: SettingsPreset;
        
        if ( input?.name )
            settingsPreset = SettingsPreset.create({ name: input.name });
        else
            settingsPreset = SettingsPreset.create();                


        if ( input?.ocr_engine )
            settingsPreset.updateOcrEngineSettings( input?.ocr_engine );
        else
            settingsPreset.updateOcrEngineSettings( this.ocrAdapter.getDefaultSettings() );

        if ( input?.overlay )
            settingsPreset.updateOverlaySettings( input?.overlay );

        if ( input?.dictionary )
            settingsPreset.updateDictionarySettings( input?.dictionary );

        await this.settingsPresetRepo.insert( settingsPreset );

        if ( settingsPreset.name === SettingsPreset.default_name ) {
            const restart = await this.ocrAdapter.updateSettings( settingsPreset.ocr_engine );

            if ( restart ) {
                await new Promise( resolve => setTimeout( resolve, 500 ) );
                await new Promise( resolve => this.ocrAdapter.restart( () => resolve(null) ) );
            }
        }
    }
}