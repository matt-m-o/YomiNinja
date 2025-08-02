import { getDefaultSettingsPresetProps } from "../../../domain/settings_preset/default_settings_preset_props";
import { OcrEngineSettings, SettingsPreset, SettingsPresetJson } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetRepository } from "../../../domain/settings_preset/settings_preset.repository";
import { OcrAdapter } from "../../adapters/ocr.adapter";

export interface CreateSettingsPreset_Input extends Partial< Omit< SettingsPresetJson, 'id' > >{
}

export class CreateSettingsPresetUseCase< TOcrSettings extends OcrEngineSettings > {

    public settingsPresetRepo: SettingsPresetRepository;
    public ocrAdapters: OcrAdapter< TOcrSettings >[];

    constructor( input: {
        settingsPresetRepo: SettingsPresetRepository,
        ocrAdapters: OcrAdapter< TOcrSettings >[]
    }) {
        this.settingsPresetRepo = input.settingsPresetRepo;
        this.ocrAdapters = input.ocrAdapters;
    }

    async execute( input?: CreateSettingsPreset_Input ): Promise< void > {

        if ( input ) {
            const foundSettingsPreset = await this.settingsPresetRepo.findOne({ name: input?.name });
            if ( foundSettingsPreset )
                return;
        }

        let settingsPreset: SettingsPreset;

        const defaultSettingsProps = getDefaultSettingsPresetProps();
        
        if ( input?.name ) {
            settingsPreset = SettingsPreset.create({
                ...defaultSettingsProps,
                name: input.name
            });
        }
        else {
            settingsPreset = SettingsPreset.create(defaultSettingsProps);
        }


        if ( input?.ocr_engines?.length ) {
            input.ocr_engines.forEach( engineSettings => {
                
                const exists = settingsPreset.getOcrEngineSettings( engineSettings.ocr_adapter_name );

                if ( !exists )
                    settingsPreset.ocr_engines.push( engineSettings );
                else
                    settingsPreset.updateOcrEngineSettings( engineSettings );
            });
        }
        else {
            this.ocrAdapters.forEach( adapter => {

                const exists = settingsPreset.getOcrEngineSettings( adapter.name );

                const ocrSettings = adapter.getDefaultSettings();

                if ( !exists )
                    settingsPreset.ocr_engines.push( ocrSettings );
                else
                    settingsPreset.updateOcrEngineSettings( ocrSettings );
            })
        }

        if ( input?.overlay )
            settingsPreset.updateOverlaySettings( input?.overlay );

        if ( input?.dictionary )
            settingsPreset.updateDictionarySettings( input?.dictionary );

        await this.settingsPresetRepo.insert( settingsPreset );

        if ( settingsPreset.name === SettingsPreset.default_name ) {

            for( const ocrAdapter of this.ocrAdapters ) {
                
                const ocrSettings = settingsPreset.getOcrEngineSettings< TOcrSettings >( ocrAdapter.name );

                if ( !ocrSettings ) return;

                await ocrAdapter.updateSettings( ocrSettings, ocrSettings );
                
                console.log('Restarting '+ocrAdapter.name);
                await new Promise( resolve => setTimeout( resolve, 500 ) );
                await new Promise( resolve => ocrAdapter.restart( () => resolve(null) ) );
            }

        }
    }
}