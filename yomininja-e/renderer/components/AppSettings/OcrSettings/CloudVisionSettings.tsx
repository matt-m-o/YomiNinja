import { Alert, Backdrop, Box, Button, Card, CardContent, CircularProgress, Container, Divider, FilledInput, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, ToggleButton, ToggleButtonGroup, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { OcrEngineSettingsU } from "../../../../electron-src/@core/infra/types/entity_instance.types";
import CommonOcrSettings, { SettingsOptionContainer } from "./CommonOcrSettings";
import { CloudVisionAPIMode, CloudVisionOcrEngineSettings } from "../../../../electron-src/@core/infra/ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PasswordField from "../../common/PasswordField";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

const ModeToggleButton = styled( ToggleButton )({
    // borderRadius: '30px'
});


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


    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newApi: CloudVisionAPIMode,
    ) => {
        updateActivePresetOcrEngine({
            ...ocrEngineSettings,
            active_api: newApi
        });
    };
    

    const ApiToggleButton = (
        <ToggleButtonGroup
            title="Select what API it should use"
            color="primary"
            value={ ocrEngineSettings?.active_api || 'main' }
            exclusive
            onChange={handleChange}
            sx={{
                margin: 'auto',
                mb: '30px'
            }}
        >
            <ModeToggleButton value="main">
                Main
            </ModeToggleButton>
            <ModeToggleButton value="demo">
                Demo
            </ModeToggleButton>
        </ToggleButtonGroup>
    );



    const divider = (
        <Divider
            sx={{
                width: '100%',
                mt: '40px',
                mb: '40px'
            }}>
        </Divider>
    );


    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            {/* <CommonOcrSettings ocrEngineSettings={ocrEngineSettings} /> */}

            <Container sx={{display: 'flex', flexDirection: 'column' }}>
                <Typography gutterBottom component="div" fontSize='1.0rem' 
                    mt={1} mb={0}
                    textAlign='center'
                    sx={{ color: 'lightgray' }}
                >
                    API Mode
                </Typography>
                {ApiToggleButton}
            </Container>

            <Box display='flex' justifyContent='space-between'>

                <Typography gutterBottom component="div" fontSize='1.2rem' mt={1} ml={2} mb={2}>
                    API Credentials
                </Typography>

                {/* <Typography gutterBottom component="div" fontSize='1.1rem' ml={1} mb={2}
                    fontWeight={0}
                    sx={{ color: '#d36464' }}
                >
                    Unauthorized
                </Typography> */}

            </Box>

            <Container
                sx={{
                    display: (
                        ocrEngineSettings?.active_api === 'main' ?
                            'flex' :
                            'none'
                    ),
                    flexDirection: 'column',
                }}
            >   

                <Button variant="contained"
                    size="large"
                    startIcon={ <InsertDriveFileOutlinedIcon/> }
                    onClick={ loadCloudVisionCredentialsFile }
                    style={{
                        width: '100%',
                        margin: '8px',
                        marginLeft: '10px',
                        marginBottom: '15px'
                    }}
                >
                    Load from file
                </Button>

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
            </Container>
            
            <Container
                sx={{
                    display: (
                        ocrEngineSettings?.active_api === 'demo' ?
                            'flex' :
                            'none'
                    ),
                    flexDirection: 'column'
                }}
            >
            
                <Button variant="contained"
                    size="large"
                    onClick={ openCloudVisionPage }
                    style={{
                        width: '100%',
                        margin: '8px',
                        marginLeft: '10px',
                    }}
                >
                    Load from Cloud Vision demo page (only a few requests)
                </Button>

            </Container>
    
        </Box>
    )
}