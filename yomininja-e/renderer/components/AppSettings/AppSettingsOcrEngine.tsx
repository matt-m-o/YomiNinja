import { Alert, Backdrop, Box, CircularProgress, Container, Divider, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { OcrEngineSettings, OverlayBehavior } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import Button from '@mui/material/Button';
import { OcrEngineSettingsU } from "../../../electron-src/@core/infra/types/entity_instance.types";
import { PpOcrEngineSettings, ppOcrAdapterName } from "../../../electron-src/@core/infra/ocr/ppocr.adapter/ppocr_settings";
import PpOcrSettings from "./OcrSettings/PpOcrSettings";


// Settings section component
export default function AppSettingsOcrEngine() {

    const { activeSettingsPreset, updateActivePresetOcrEngine } = useContext( SettingsContext );

    const ppOcrSettings = activeSettingsPreset?.ocr_engines
        .find( item => item.ocr_adapter_name === 'PpOcrAdapter' ) as PpOcrEngineSettings;



    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                OCR Engines
            </Typography>
            
            <PpOcrSettings ocrEngineSettings={ppOcrSettings} />
                
        </Box>
    )
}