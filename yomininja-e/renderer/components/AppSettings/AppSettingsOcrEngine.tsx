import { Box, Grid, Typography, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { CSSProperties, useContext, useState } from "react";
import { PpOcrEngineSettings, ppOcrAdapterName } from "../../../electron-src/@core/infra/ocr/ppocr.adapter/ppocr_settings";
import PpOcrSettings from "./OcrSettings/PpOcrSettings";
import CloudVisionSettings from "./OcrSettings/CloudVisionSettings";
import { CloudVisionOcrEngineSettings } from "../../../electron-src/@core/infra/ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import Tab from '@mui/material/Tab';
import GoogleLensSettings from "./OcrSettings/GoogleLensSettings";
import { GoogleLensOcrEngineSettings } from "../../../electron-src/@core/infra/ocr/google_lens_ocr.adapter/google_lens_ocr_settings";
import { MangaOcrEngineSettings } from "../../../electron-src/@core/infra/ocr/manga_ocr.adapter/manga_ocr_settings";
import MangaOcrSettings from "./OcrSettings/MangaOcrSettings";


const TabItem = styled(Tab)({
    textTransform: 'none',
    fontSize: '1.08rem',
    "&.Mui-selected": {
        fontWeight: '600'
    }
});

// Settings section component
export default function AppSettingsOcrEngine() {

    const { activeSettingsPreset, updateActivePresetOcrEngine } = useContext( SettingsContext );

    const [ tab, setTab ] = useState('1');

    const ppOcrSettings = activeSettingsPreset?.ocr_engines
        .find( item => item.ocr_adapter_name === 'PpOcrAdapter' ) as PpOcrEngineSettings;

    const cloudVisionSettings = activeSettingsPreset?.ocr_engines
        .find( item => item.ocr_adapter_name === 'CloudVisionOcrAdapter' ) as CloudVisionOcrEngineSettings;

    const googleLensSettings = activeSettingsPreset?.ocr_engines
        .find( item => item.ocr_adapter_name === 'GoogleLensOcrAdapter' ) as GoogleLensOcrEngineSettings;

    const mangaOcrSettings = activeSettingsPreset?.ocr_engines
        .find( item => item.ocr_adapter_name === 'MangaOcrAdapter' ) as MangaOcrEngineSettings;

    function tabHandleChange(event: React.SyntheticEvent, newValue: string) {
        setTab(newValue);
    };

    return (
        <Box sx={{ flexGrow: 1, margin: 1, mt: 0 }}>

            <Typography gutterBottom variant="h6" component="div" ml={0} mb={3}>
                OCR Engines
            </Typography>

            <TabContext value={tab}>
                <Box 
                    sx={{
                        borderBottom: '1px solid #313131',
                        borderRadius: '10px 10px 0px 0px',
                        backgroundColor: '#181818'
                    }}>
                    <TabList onChange={tabHandleChange} >
                        <TabItem label="PaddleOCR" value="1"/>
                        <TabItem label="Google Cloud Vision" value="2"/>
                        <TabItem label="Google Lens" value="3"/>
                        <TabItem label="MangaOCR" value="4"/>
                    </TabList>
                </Box>

                <Box
                    sx={{
                        // outline: '1px solid grey',
                        backgroundColor: '#181818',
                        borderRadius: '0px 0px 15px 15px'
                    }}
                >
                    <TabPanel value="1" >
                        <PpOcrSettings ocrEngineSettings={ppOcrSettings} />
                    </TabPanel>
                    <TabPanel value="2" >
                        <CloudVisionSettings ocrEngineSettings={cloudVisionSettings}/>
                    </TabPanel>
                    <TabPanel value="3" >
                        <GoogleLensSettings ocrEngineSettings={googleLensSettings}/>
                    </TabPanel>
                    <TabPanel value="4" >
                        <MangaOcrSettings ocrEngineSettings={mangaOcrSettings}/>
                    </TabPanel>
                </Box>
                

            </TabContext>
                
        </Box>

    )
}