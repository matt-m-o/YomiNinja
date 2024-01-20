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
        loadCloudVisionCredentialsFile,
        openCloudVisionPage
    } = useContext( SettingsContext );


    const divider = (
        <Divider
            sx={{
                width: '100%',
                mt: '20px',
                mb: '20px'
            }}>
            or
        </Divider>
    );

    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <CommonOcrSettings ocrEngineSettings={ocrEngineSettings} />
            
            <Typography gutterBottom component="div" fontSize='1.1rem' ml={2} mb={2}>
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
                    onClick={ loadCloudVisionCredentialsFile }
                    style={{
                        width: '100%',
                        margin: '8px',
                        marginLeft: '10px',
                    }}
                >
                    Load from file
                </Button>
                
                { divider }

                <PasswordField
                    label="Private key"
                    required
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
                    required
                    value={ ocrEngineSettings.client_email }
                    onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
                        console.log(event.target.value);
                        updateActivePresetOcrEngine({
                            ...ocrEngineSettings,
                            client_email: event.target.value
                        });
                    } }
                />

                { divider }
            
                <Button variant="contained"
                    onClick={ openCloudVisionPage }
                    style={{
                        width: '100%',
                        margin: '8px',
                        marginLeft: '10px',
                    }}
                >
                    Load from Cloud Vision demo page (for a few tests)
                </Button>

            </Container>
    
        </Box>
    )
}