import { Alert, Backdrop, Box, Button, Card, CardContent, CircularProgress, Container, Divider, FilledInput, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, ToggleButton, ToggleButtonGroup, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { GoogleLensOcrEngineSettings } from "../../../../electron-src/@core/infra/ocr/google_lens_ocr.adapter/google_lens_ocr_settings";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PasswordField from "../../common/PasswordField";


type GoogleLensSettingsProps = {
    ocrEngineSettings: GoogleLensOcrEngineSettings;    
}

// Settings section component
export default function GoogleLensSettings( props: GoogleLensSettingsProps ) {

    const { ocrEngineSettings } = props;

    const {
        updateActivePresetOcrEngine,
        openGooglePage,
        removeGoogleCookies,
        hasGoogleCookies
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
                
                <Typography mb={6}>
                    Google Lens serves as free alternative to Cloud Vision, delivering similar results.
                    However, it's essential to maintain realistic expectations as this API was originally designed for Google's apps,
                    which means its longevity is uncertain.
                </Typography>

                <Typography mb={4}>
                    In certain regions, it's important to agree to the cookies consent banner for the proper functioning of this API.
                    To do this, click the button below to open Google and either <strong>accept</strong> or <strong>reject</strong> the cookies.
                </Typography>

            </Box>

            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}
                style={{
                    padding: 0,
                    margin: 0
                }}
            >

                <PasswordField
                    label="API key"
                    required
                    value={ ocrEngineSettings?.api_key }
                    onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
                        // console.log(event.target.value);
                        updateActivePresetOcrEngine({
                            ...ocrEngineSettings,
                            api_key: event.target.value
                        });
                    } }
                    sx={{ mb: 2 }}
                />

            </Container>
            
            <Container
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    margin: 0
                }}
            >
            
                <Button variant="contained"
                    size="large"
                    onClick={ () => {
                        openGooglePage()
                    }}
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    Go to Google
                </Button>

                <Button variant="contained"
                    size="large"
                    color='error'
                    onClick={ removeGoogleCookies }
                    fullWidth
                    disabled={ !hasGoogleCookies }
                >
                    Delete Cookies
                </Button>

            </Container>
    
        </Box>
    )
}