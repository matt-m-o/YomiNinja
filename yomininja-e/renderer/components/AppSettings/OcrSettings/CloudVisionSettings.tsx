import { Alert, Backdrop, Box, Card, CardContent, CircularProgress, Container, Divider, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { OcrEngineSettingsU } from "../../../../electron-src/@core/infra/types/entity_instance.types";
import CommonOcrSettings, { SettingsOptionContainer } from "./CommonOcrSettings";
import { CloudVisionOcrEngineSettings } from "../../../../electron-src/@core/infra/ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings";


type CloudVisionSettingsProps = {
    ocrEngineSettings: CloudVisionOcrEngineSettings;    
}

// Settings section component
export default function CloudVisionSettings( props: CloudVisionSettingsProps ) {

    const { ocrEngineSettings } = props;

    const { updateActivePresetOcrEngine } = useContext( SettingsContext );    


    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                Cloud Vision (Google)
            </Typography>

            <CommonOcrSettings ocrEngineSettings={ocrEngineSettings} />

        </Box>
    )
}