import { result } from "lodash";
import { sleep } from "../../../../util/sleep.util";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { OcrEngineSettings, SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { OcrAdapter, OcrAdapterStatus } from "../../adapters/ocr.adapter";



export type RecognizeSelectionInput = {    
    partialResult: OcrResultScalable;
    regionId?: string;
    selectedItemIds: string[];
}

export class RecognizeSelectionUseCase< TOcrSettings extends OcrEngineSettings > {

    constructor(
        public ocrAdapters: OcrAdapter< TOcrSettings >[],
    ) {}

    async execute( input: RecognizeSelectionInput ): Promise< OcrResultScalable | null > {

        const { partialResult, regionId, selectedItemIds } = input;

        let ocrAdapter = this.getAdapter( partialResult.ocr_engine_name );

        if (
            !partialResult.ocr_engine_name ||
            !partialResult.language ||
            !ocrAdapter ||
            !ocrAdapter.recognizeSelection
        )
            return partialResult;
        
        const timeout = 60_000;
        const sleepTimeMs = 25;
        let totalSleep = 0;

        while (
            ocrAdapter.status !== OcrAdapterStatus.Enabled &&
            totalSleep < timeout
        ) {
            await sleep(sleepTimeMs);
            totalSleep += sleepTimeMs;
        }
        if ( ocrAdapter.status !== OcrAdapterStatus.Enabled )
            return partialResult;

        const targetRegion = partialResult.ocr_regions.find( region => region.id == regionId );

        const ocrResult = await ocrAdapter.recognizeSelection({
            partialOcrResult: partialResult,
            selectedItemIds: selectedItemIds,
            resultId: targetRegion?.result_id
        });

        if ( !ocrResult )
            return partialResult;

        if ( regionId && partialResult.ocr_regions.length > 0 ) {

            if ( !targetRegion )
                return partialResult;

            partialResult.addRegionResult({
                regionId: targetRegion?.id,
                regionResult: ocrResult,
                regionPosition: targetRegion.position,
                regionSize: targetRegion.size,
                globalScaling: false,
            });

            return partialResult;
        }

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