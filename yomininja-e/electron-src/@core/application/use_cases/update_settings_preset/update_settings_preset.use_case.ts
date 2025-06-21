import { OcrEngineSettings, SettingsPreset, SettingsPresetJson } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetRepository } from "../../../domain/settings_preset/settings_preset.repository";
import { OcrAdapter } from "../../adapters/ocr.adapter";
import { getDefaultSettingsPresetProps } from "../../../domain/settings_preset/default_settings_preset_props";

export type UpdateSettingsPreset_Input = {
    options?: UpdateSettingsPresetOptions
} & SettingsPresetJson;

export type UpdateSettingsPresetOptions = {
    restartOcrEngine?: boolean;
};

export class UpdateSettingsPresetUseCase< TOcrSettings extends OcrEngineSettings > {

    constructor(
        public settingsPresetRepo: SettingsPresetRepository,
        public ocrAdapters: OcrAdapter< TOcrSettings >[],
    ) {}

    async execute( input: UpdateSettingsPreset_Input ): Promise< UpdateSettingsPreset_Output > {

        const { options } = input;

        const output: UpdateSettingsPreset_Output = {
            restartOcrAdapter: false,
        };

        const settingsPreset = await this.settingsPresetRepo.findOne({ id: input.id });

        const defaultSettingsProps = getDefaultSettingsPresetProps();

        if ( !settingsPreset )
            return output;


        settingsPreset.name = input.name;
        settingsPreset.version = input.version;

        const ocrAdaptersToBeRestarted: string[] = [];

        if ( input?.ocr_engines?.length ) {

            // console.log("Input:");
            // console.log(input);

            if ( !Array.isArray( input.ocr_engines ) )
                input.ocr_engines = [];

            for ( const engineSettings of input.ocr_engines ) {

                // console.log( engineSettings );

                const restart = await this.handleOcrAdapterSettingsUpdate(
                    engineSettings as TOcrSettings,
                    settingsPreset,
                );

                if ( restart ) {
                    ocrAdaptersToBeRestarted.push( engineSettings.ocr_adapter_name );
                    output.restartOcrAdapter = true;
                }
            }
        }

        for( const adapter of this.ocrAdapters ) {

            const existingSettings = settingsPreset.getOcrEngineSettings< TOcrSettings >( adapter.name );

            let defaultSettings = adapter.getDefaultSettings();

            if ( existingSettings ) {
                defaultSettings = {
                    ...adapter.getDefaultSettings(),
                    ...existingSettings,
                };
            }

            const restart = await this.handleOcrAdapterSettingsUpdate( defaultSettings, settingsPreset );

            if ( restart ) {
                ocrAdaptersToBeRestarted.push( adapter.name );
                output.restartOcrAdapter = true;
            }
        }
        
        settingsPreset.updateOverlaySettings({
            ...defaultSettingsProps.overlay,
            ...input.overlay,
            hotkeys: {
                ...defaultSettingsProps.overlay.hotkeys,
                ...input.overlay.hotkeys
            }
        });
        settingsPreset.updateDictionarySettings({
            ...defaultSettingsProps.dictionary,
            ...input.dictionary,
        });
        settingsPreset.updateGeneralSettings({
            ...defaultSettingsProps.general,
            ...input.general,
        });
        settingsPreset.updateCompatibilitySettings({
            ...defaultSettingsProps.compatibility,
            ...input.compatibility,
        });

        // console.log( settingsPreset );

        await this.settingsPresetRepo.update( settingsPreset );
        
        if ( options?.restartOcrEngine ) {

            // await new Promise( resolve => setTimeout( resolve, 500 ) );

            for ( const adapterName of ocrAdaptersToBeRestarted ) {

                const ocrAdapter = this.getOcrAdapter( adapterName );

                if ( !ocrAdapter ) continue;

                await new Promise( resolve => ocrAdapter.restart( () => resolve(null) ) );
            }

        }

        return output;
    }

    async handleOcrAdapterSettingsUpdate(
        engineSettingsUpdate: TOcrSettings,
        settingsPreset: SettingsPreset,
    ): Promise< boolean > {

        let restart = false;

        const { ocr_adapter_name } = engineSettingsUpdate;

        const ocrEngineAdapter = this.getOcrAdapter( ocr_adapter_name );

        if ( !ocrEngineAdapter ) return false;

        const currentOcrEngineSettings = settingsPreset.getOcrEngineSettings< TOcrSettings >( ocr_adapter_name );

        if ( !currentOcrEngineSettings ) {
            settingsPreset.ocr_engines.push( engineSettingsUpdate );
            restart = true;
        }
        
        const result = await ocrEngineAdapter.updateSettings(
            engineSettingsUpdate,
            currentOcrEngineSettings
        );

        restart = result.restart;

        settingsPreset.updateOcrEngineSettings( result.settings );

        return restart;
    }


    private getOcrAdapter( adapterName: string ): OcrAdapter< TOcrSettings > | undefined {
        return this.ocrAdapters.find(
            item => item.name === adapterName
        );
    }
}

type UpdateSettingsPreset_Output = {
    restartOcrAdapter: boolean;
}