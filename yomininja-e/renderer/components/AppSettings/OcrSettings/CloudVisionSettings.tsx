import { Alert, Backdrop, Box, Button, Card, CardContent, CircularProgress, Container, Divider, FilledInput, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { OcrEngineSettingsU } from "../../../../electron-src/@core/infra/types/entity_instance.types";
import CommonOcrSettings, { SettingsOptionContainer } from "./CommonOcrSettings";
import { CloudVisionOcrEngineSettings } from "../../../../electron-src/@core/infra/ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PasswordField from "../../common/PasswordField";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

type CloudVisionSettingsProps = {
    ocrEngineSettings: CloudVisionOcrEngineSettings;    
}

// Settings section component
export default function CloudVisionSettings( props: CloudVisionSettingsProps ) {

    const { ocrEngineSettings } = props;

    const {
        updateActivePresetOcrEngine,
        loadCloudVisionCredentialsFile
    } = useContext( SettingsContext );


    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                Cloud Vision (Google)
            </Typography>

            <CommonOcrSettings ocrEngineSettings={ocrEngineSettings} />

            
            
            
            <Typography gutterBottom component="div" mb={1} fontSize='1.1rem' ml={2}>
                Credentials
            </Typography>

            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >

                <Button variant="contained"
                    startIcon={ <InsertDriveFileOutlinedIcon/> }
                    sx={{
                        m: '10px'
                    }}
                    onClick={ loadCloudVisionCredentialsFile }
                >
                    Load credentials from file
                </Button>

                <Divider sx={{ width: '100%', m: '10px' }}>
                    or
                </Divider>

                <PasswordField
                    label="Private key"
                    value={ ocrEngineSettings.private_key }
                    onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
                        // console.log(event.target.value);
                        updateActivePresetOcrEngine({
                            ...ocrEngineSettings,
                            private_key: event.target.value
                        });
                    } }
                />

                <PasswordField
                    label="Client email"
                    value={ ocrEngineSettings.client_email }
                    onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
                        console.log(event.target.value);
                        updateActivePresetOcrEngine({
                            ...ocrEngineSettings,
                            client_email: event.target.value
                        });
                    } }
                />

            </Container>
    
        </Box>
    )
}