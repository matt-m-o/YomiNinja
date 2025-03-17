import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { OcrEngineSettings, SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { OcrAdapter, OcrAdapterStatus } from "../../adapters/ocr.adapter";



export type RecognizeSelectionInput = {    
    partialResult: OcrResultScalable;
    selectedItemIds: string[];
} 

export class RecognizeSelectionUseCase< TOcrSettings extends OcrEngineSettings > {

    constructor(
        public ocrAdapters: OcrAdapter< TOcrSettings >[],
    ) {}

    async execute( input: RecognizeSelectionInput ): Promise< OcrResultScalable | null > {

        const { partialResult } = input;

        let ocrAdapter = this.getAdapter( partialResult.ocr_engine_name );

        if (
            !partialResult.ocr_engine_name ||
            !partialResult.language ||
            !ocrAdapter ||
            !ocrAdapter.recognizeSelection
        )
            return partialResult;
        
        const ocrResult = await ocrAdapter.recognizeSelection({
            partialOcrResult: input.partialResult,
            selectedItemIds: input.selectedItemIds,
        });

        if ( !ocrResult )
            return partialResult;

        return ocrResult;
    }

    private getAdapter( adapterName?: string ): OcrAdapter< TOcrSettings > | null {

        let adapter: OcrAdapter< TOcrSettings > | null = null;

        if ( adapterName )
            adapter = this.ocrAdapters.find( adapter => adapter.name === adapterName ) || null;

        // if ( !adapter )
        //     adapter = this.ocrAdapters?.[0] || null;

        return adapter;
    }

    getSupportedOcrEngines = (): string[] => {
        const enabledEngines = this.ocrAdapters.filter(
            adapter => adapter.status !== OcrAdapterStatus.Disabled && adapter.recognizeSelection
        );
        return enabledEngines.map( adapter => adapter.name );
    }
}