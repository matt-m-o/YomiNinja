import { Alert, Backdrop, Box, Button, Card, CardContent, CircularProgress, Container, Divider, FilledInput, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, ToggleButton, ToggleButtonGroup, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { OcrEngineSettingsU } from "../../../../electron-src/@core/infra/types/entity_instance.types";
import CommonOcrSettings, { SettingsOptionContainer } from "./CommonOcrSettings";
import { CloudVisionAPIMode, CloudVisionOcrEngineSettings } from "../../../../electron-src/@core/infra/ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PasswordField from "../../common/PasswordField";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { ipcRenderer } from "../../../utils/ipc-renderer";

const ModeToggleButton = styled( ToggleButton )({
    // borderRadius: '30px'
});

const Link = styled( 'a' )({
    // textDecoration: 'none',
    color: 'inherit',
    fontWeight: 700,
})


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
        if ( !newApi ) return;
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

    function createLink(input: { link: string, displayText: string }) {
        return (
            <Link href="#"
                title={input.link}
                onClick={ () => openLink(input.link)  }
            >
                {input.displayText}
            </Link>
        )
    }

    const googleCloudConsoleLink = createLink({
        link: 'https://console.cloud.google.com',
        displayText: 'Google Cloud'
    });

    const billingBudgetLink = createLink({
        link: 'https://cloud.google.com/billing/docs/how-to/budgets',
        displayText: 'Billing budget'
    });

    const pricingLink = createLink({
        link: 'https://cloud.google.com/vision/pricing#prices',
        displayText: 'here'
    });
    

    function openLink( link: string ) {
        ipcRenderer.invoke( 'open_link', link );
    }

    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            {/* <CommonOcrSettings ocrEngineSettings={ocrEngineSettings} /> */}

            <Typography component="div" fontSize='1.0rem'
                mt={1} mb={4}
            >
                Utilizes the same advanced technology as Google Lens for accurate and powerful text recognition.
            </Typography>

            <Container sx={{display: 'flex', flexDirection: 'column', mb: 2 }}>
                <Typography gutterBottom component="div" fontSize='1.0rem' 
                    mt={1} mb={0}
                    textAlign='center'
                    sx={{ color: 'lightgray' }}
                >
                    API Mode
                </Typography>
                {ApiToggleButton}
            </Container>
            
            { ocrEngineSettings?.active_api === 'main' &&
                <Typography mb={4}>
                    The main API allows for up to 1000 free requests per month. For detailed pricing information, click {pricingLink}.
                </Typography>
            }
            { ocrEngineSettings?.active_api === 'demo' &&
                <Typography mb={4}>
                    The demo API allows you to use Cloud Vision for free with a very limited number of requests each time you load the demo credentials.
                    You can load the credentials multiple times for continued testing, but there are no guarantees.
                </Typography>
            }

            <Box> {/* display='flex' justifyContent='space-between' */}

                <Typography gutterBottom component="div" fontSize='1.2rem' mt={1} mb={2}>
                    API Credentials
                </Typography>

                {/* <Typography gutterBottom component="div" fontSize='1.1rem' ml={1} mb={2}
                    fontWeight={0}
                    sx={{ color: '#d36464' }}
                >
                    Unauthorized
                </Typography> */}

                { ocrEngineSettings?.active_api === 'main' &&
                    <Typography mb={4}>
                        To enable Google Cloud Vision main API, sign in to {googleCloudConsoleLink}, create a project with billing, and set up a service account with a JSON key.                    It's advisable to set a {billingBudgetLink} to avoid surprises on your bill.
                    </Typography>
                }

                { ocrEngineSettings?.active_api === 'demo' && <>
                    <Typography>
                        To load the demo API credentials, follow these steps:
                    </Typography>
                    <ol>
                        <li>Click on the button bellow.</li>
                        <li>Upload any image file.</li>
                        <li>Solve the reCAPTCHA.</li>
                    </ol>
                </> }

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
                style={{
                    padding: 0,
                    margin: 0
                }}
            >

                <Button variant="contained"
                    size="large"
                    startIcon={ <InsertDriveFileOutlinedIcon/> }
                    onClick={ loadCloudVisionCredentialsFile }
                    fullWidth
                    sx={{ mb: 3 }}
                >
                    Load from JSON file
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
                    sx={{ mb: 2 }}
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
                style={{
                    padding: 0,
                    margin: 0
                }}
            >
            
                <Button variant="contained"
                    size="large"
                    onClick={ openCloudVisionPage }
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    Load demo API credentials
                </Button>

            </Container>
    
        </Box>
    )
}