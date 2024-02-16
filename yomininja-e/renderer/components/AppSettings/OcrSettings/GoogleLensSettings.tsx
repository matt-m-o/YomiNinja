import { Alert, Backdrop, Box, Button, Card, CardContent, CircularProgress, Container, Divider, FilledInput, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, ToggleButton, ToggleButtonGroup, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { OcrEngineSettingsU } from "../../../../electron-src/@core/infra/types/entity_instance.types";
import CommonOcrSettings, { SettingsOptionContainer } from "./CommonOcrSettings";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PasswordField from "../../common/PasswordField";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { GoogleLensOcrEngineSettings } from "../../../../electron-src/@core/infra/ocr/google_lens_ocr.adapter/google_lens_ocr_settings";



type GoogleLensSettingsProps = {
    ocrEngineSettings: GoogleLensOcrEngineSettings;    
}

// Settings section component
export default function GoogleLensSettings( props: GoogleLensSettingsProps ) {

    const { ocrEngineSettings } = props;

    const {
        updateActivePresetOcrEngine,
        openGooglePage
    } = useContext( SettingsContext );


    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            {/* <CommonOcrSettings ocrEngineSettings={ocrEngineSettings} /> */}

            <Typography component="div" fontSize='1.0rem'
                mt={1} mb={4}
            >
                Utilizes the Google Lens API.
            </Typography>
            

            <Box>
                
                <Typography mb={4}>

                </Typography>

            </Box>
            
            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
            
                <Button variant="contained"
                    size="large"
                    onClick={ openGooglePage }
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    Open Google Page
                </Button>

            </Container>
    
        </Box>
    )
}