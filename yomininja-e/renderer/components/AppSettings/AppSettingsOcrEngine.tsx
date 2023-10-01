import { Box, Container, Divider, FormControlLabel, FormGroup, Slider, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { OcrEngineSettings, OverlayBehavior } from "../../../electron-src/@core/domain/settings_preset/settings_preset";


// Settings section component
export default function AppSettingsOcrEngine() {

    const { activeSettingsPreset, updateActivePresetOcrEngine } = useContext( SettingsContext );    

    const ocrEngineSettings: OcrEngineSettings = activeSettingsPreset?.ocr_engine;

    const imageScalingFactor = ocrEngineSettings?.image_scaling_factor || 1;
   

    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                OCR Engine
            </Typography>
            
            <Container sx={{ mt: 2, mb: 2 }}>

                <Typography gutterBottom component="div" margin={2} ml={0} fontSize={'1.1rem'}>
                    Image scaling factor
                </Typography>

                <Stack spacing={2} direction="row" sx={{ mb: 1, pl: 2, pr: 2 }} alignItems="center">

                    <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                        Speed
                    </Typography>

                    <Slider
                        marks
                        min={0.1}
                        max={1}
                        step={0.05}
                        valueLabelDisplay="auto"
                        value={ imageScalingFactor }
                        style={{ marginRight: 8 }}
                        onChange={ ( event, newValue ) => {
                            if (typeof newValue === 'number') {
                                updateActivePresetOcrEngine({ image_scaling_factor: newValue });
                            }
                        }}                    
                    />

                    <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                        Accuracy
                    </Typography>

                </Stack>
            
            </Container>
                
        </Box>
    )
}