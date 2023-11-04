import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";
import os from 'os';

export type CpuHotfixResult = {
    ocrEngineSettings: OcrEngineSettings;
    restartEngine: boolean;
}

export function applyCpuHotfix( ocrEngineSettings: OcrEngineSettings, cpuModel?: string ): CpuHotfixResult {

    const cpu = os.cpus()[0];
    // console.log({ cpu });

    cpuModel = cpuModel || cpu.model;

    let restartEngine = false;

    const isRyzen = cpuModel.toLowerCase().includes( 'ryzen' );
    const seriesNumber = extractModelNumber( cpuModel );    

    if ( 
        isRyzen && 
        Number( seriesNumber ) >= 7000
    ) {

        const { inference_runtime } = ocrEngineSettings;

        if ( inference_runtime == 'Open_VINO' ) {
            ocrEngineSettings.inference_runtime = 'ONNX_CPU';
            restartEngine = true;
        }
    }
    
    return {
        ocrEngineSettings,
        restartEngine
    };
}

function extractModelNumber( modelName: string ): string {

    // Define a regular expression pattern to match the largest model number.
    const regex = /(\d{3,})/;
  
    // Find all matches of the pattern in the modelName.
    const matches = modelName.match(regex);
  
    // Check if matches are found and return the last matched number or an empty string.
    if ( matches && matches.length > 0 ) {
        return matches[ matches.length - 1 ];
    } else {
        return "";
    }
}
  