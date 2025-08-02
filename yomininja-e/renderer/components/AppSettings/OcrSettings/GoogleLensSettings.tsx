import { Alert, Backdrop, Box, Button, Card, CardContent, CircularProgress, Container, Divider, FilledInput, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, ToggleButton, ToggleButtonGroup, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { GoogleLensOcrEngineSettings } from "../../../../electron-src/@core/infra/ocr/google_lens_ocr.adapter/google_lens_ocr_settings";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PasswordField from "../../common/PasswordField";
import { SettingsOptionContainer } from "./CommonOcrSettings";
import OcrSettingsSlider from "./OcrSettingsSlider";


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

    const defaultMaxImageArea = 1_000_000;
    const defaultMaxImageDimension = 1000;

    const [ maxImageArea, setMaxImageArea ] = useState(
        ocrEngineSettings?.max_image_area || defaultMaxImageArea
    );
    const [ maxImageDimension, setMaxImageDimension ] = useState(
        ocrEngineSettings?.max_image_dimension || defaultMaxImageDimension
    );

    function resetMaxImageArea() {
        updateActivePresetOcrEngine({
            ...ocrEngineSettings,
            max_image_area: defaultMaxImageArea
        });
        setMaxImageArea( defaultMaxImageArea );
    }

    function resetMaxImageDimension() {
        updateActivePresetOcrEngine({
            ...ocrEngineSettings,
            max_image_dimension: defaultMaxImageDimension
        });
        setMaxImageDimension( defaultMaxImageDimension );
    }


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

                <SettingsOptionContainer sx={{ mt: 0, mb: 8 }}>
                    <OcrSettingsSlider
                        label="Max image area"
                        title="Limit the image size by restricting its total pixel area (width × height)"
                        leftLabel="Speed"
                        rightLabel="Accuracy"
                        min={250_000}
                        max={3_000_000}
                        step={1000}
                        marks={[
                            { value: 250_000, label: "250K px" },
                            {
                                value: defaultMaxImageArea,
                                label: `${defaultMaxImageArea/1_000_000}M px`
                            },
                            { value: 3_000_000, label: "3M px" },
                        ]}
                        value={ maxImageArea }
                        onChange={ ( event, newValue ) => {
                            if (typeof newValue === 'number') {
                                setMaxImageArea( newValue );
                            }
                        }}
                        onChangeCommitted={ () => {
                            // console.log({ imageScalingFactor });
                            updateActivePresetOcrEngine({
                                ...ocrEngineSettings,
                                max_image_area: maxImageArea
                            });
                        }}
                        reset={ resetMaxImageArea }
                    />
                
                </SettingsOptionContainer>

                <SettingsOptionContainer sx={{ mt: 2, mb: 8 }}>
                    <OcrSettingsSlider
                        label="Max image width/height"
                        title="Limit the image size by restricting the largest dimension (width or height)"
                        leftLabel="Speed"
                        rightLabel="Accuracy"
                        min={100}
                        max={5000}
                        step={1}
                        marks={[
                            { value: 100, label: "100 px" },
                            {
                                value: defaultMaxImageDimension,
                                label: `${defaultMaxImageDimension/1000}K px`
                            },
                            { value: 5000, label: "5K px" },
                        ]}
                        value={ maxImageDimension }
                        onChange={ ( event, newValue ) => {
                            if (typeof newValue === 'number') {
                                setMaxImageDimension( newValue );
                            }
                        }}
                        onChangeCommitted={ () => {
                            // console.log({ imageScalingFactor });
                            updateActivePresetOcrEngine({
                                ...ocrEngineSettings,
                                max_image_dimension: maxImageDimension
                            });
                        }}
                        reset={ resetMaxImageDimension }
                    />
                
                </SettingsOptionContainer>


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