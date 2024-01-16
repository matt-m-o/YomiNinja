import { Box,  Typography } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext } from "react";
import { PpOcrEngineSettings, ppOcrAdapterName } from "../../../electron-src/@core/infra/ocr/ppocr.adapter/ppocr_settings";
import PpOcrSettings from "./OcrSettings/PpOcrSettings";
import CloudVisionSettings from "./OcrSettings/CloudVisionSettings";
import { CloudVisionOcrEngineSettings } from "../../../electron-src/@core/infra/ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings";


// Settings section component
export default function AppSettingsOcrEngine() {

    const { activeSettingsPreset, updateActivePresetOcrEngine } = useContext( SettingsContext );

    const ppOcrSettings = activeSettingsPreset?.ocr_engines
        .find( item => item.ocr_adapter_name === 'PpOcrAdapter' ) as PpOcrEngineSettings;

    const cloudVisionSettings = activeSettingsPreset?.ocr_engines
        .find( item => item.ocr_adapter_name === 'CloudVisionOcrAdapter' ) as CloudVisionOcrEngineSettings;


    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                OCR Engines
            </Typography>
            
            <PpOcrSettings ocrEngineSettings={ppOcrSettings} />

            <CloudVisionSettings ocrEngineSettings={cloudVisionSettings}/>
                
        </Box>
    )
}