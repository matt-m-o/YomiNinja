import { CSSProperties, useContext, useEffect, useState } from "react"
import { LanguagesContext } from "../../context/languages.provider";
import { Autocomplete, Box, Button, Card, CardContent, Container, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel, OutlinedInput, SxProps, TextField, TextFieldProps, Theme, Typography, styled } from "@mui/material";
import { ProfileContext } from "../../context/profile.provider";
import { CaptureSourceContext, CaptureSourceProvider } from "../../context/capture_source.provider";
import HotkeyHints from "./HotkeyHints";
import { ScreenshotMonitorRounded } from "@mui/icons-material";
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import OcrTemplateSelector from "./OcrTemplateSelector";
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const ButtonInput = styled(TextField)({
    minWidth: '500px',
    '& input': {
        cursor: 'pointer',
        textAlign: 'start',
        paddingLeft: '15px'
    }
});

const TextFieldCapitalize = styled(TextField)({
    '& input': {
        textTransform: 'capitalize'
    }
});


export default function HomeContent() {

    const { languages } = useContext( LanguagesContext );
    const {
        profile,
        changeActiveOcrLanguage,
        changeSelectedOcrEngine
    } = useContext( ProfileContext );

    const { activeCaptureSource } = useContext( CaptureSourceContext );

    const activeOcrLanguage: string = profile?.active_ocr_language.name || '';
    const languageOptions: string[] = languages?.map( language => language.name );

    // {Adapter_name : Engine_name}
    const [ supportedOcrEngines, setSupportedOcrEngines ] = useState<{ [key: string]: string; }>({});

    const ocrEngineOptions = Object.values( supportedOcrEngines );
    const selectedOcrEngine = supportedOcrEngines[ profile?.selected_ocr_adapter_name ] || '';


    useEffect( () => {
        getSupportedOcrEngines()
            .then( dict => {
                setSupportedOcrEngines( dict );
            });
    }, [] );

    function handleLanguageSelectChange( languageName: string ) {

        if (!languageName) return;

        const language = languages?.find( language => language.name === languageName.toLowerCase() );

        if ( !language ) return;
        
        changeActiveOcrLanguage( language );
    }

    function openCaptureSourceSelectionWindow() {
        global.ipcRenderer.invoke('main:show_capture_source_selection');
    }

    async function getSupportedOcrEngines(): Promise< { [key: string]: string; } > {
        const result = await global.ipcRenderer.invoke( 'ocr_recognition:get_supported_ocr_engines' ) as { [key: string]: string; };
        return result;
    }

    function handleOcrEngineSelection( selectedEngineName: string ) {
        
        Object.entries( supportedOcrEngines )
            .forEach( ([ adapterName, engineName ]) => {

                if ( engineName !== selectedEngineName )
                    return;

                changeSelectedOcrEngine( adapterName );
            });
    }

    const CaptureSourceButton = (
        <ButtonInput
            type='button'
            label="Capture Source"
            title='Click to change the Capture Source'
            value={ activeCaptureSource?.name || '' }
            onClick={ openCaptureSourceSelectionWindow }
            // fullWidth
            InputProps={{
                startAdornment: <ScreenshotMonitorRounded/>,
                endAdornment: <MoreVertRoundedIcon/>,
                style: {
                    cursor: 'pointer'
                }
            }}
            sx={{ mb: '25px' }}
        />
    );

    const selectListBoxCSS: CSSProperties = {
        backgroundColor: '#121212',
    };

    return (
        
        <Box display='flex'
            justifyContent='center'
            flexDirection='column'
            m={'auto'}
            sx={{ userSelect: 'none' }}
        >

            <Card variant="elevation" sx={{ borderRadius: 4, mb: 3, pl: 1, pr: 1 }}>
                <CardContent>

                    <Typography mb={5} mt={1} fontSize='1.2rem'>
                        Select a capture source and the language that matches its content
                    </Typography>

                    <Container
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            maxWidth: 'max-content'
                        }}
                    >

                        {CaptureSourceButton}

                        <Autocomplete autoHighlight
                            fullWidth
                            renderInput={ (params) => {
                                return <TextField {...params}
                                    label='Primary OCR Engine'
                                    fullWidth
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <AutoAwesomeIcon sx={{ mr: '10px' }} />
                                        ),
                                        style: {
                                            paddingLeft: '14px'
                                        }
                                    }}
                                />
                            }}
                            value={ selectedOcrEngine || '' }
                            onChange={( event: any, newValue: string | null ) => {
                                handleOcrEngineSelection( newValue );
                            }}
                            options={ ocrEngineOptions || [] }
                            sx={{
                                minWidth: '450px',
                                mb: '25px',
                            }}
                            ListboxProps={{ style: selectListBoxCSS }}
                        />

                        <Autocomplete autoHighlight
                            fullWidth
                            renderInput={ (params) => {
                                return <TextFieldCapitalize {...params}
                                    label='OCR Language'
                                    fullWidth
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: <TranslateOutlinedIcon sx={{ mr: '10px' }}/>,
                                        style: { paddingLeft: '14px', textTransform: 'capitalize' }
                                    }}
                                    style={{ textTransform: 'capitalize' }}
                                />
                            }}
                            value={ activeOcrLanguage || '' }
                            onChange={( event: any, newValue: string | null ) => {
                                handleLanguageSelectChange( newValue );
                            }}
                            options={ languageOptions || [] }
                            sx={{ mb: '25px', textTransform: 'capitalize' }}
                            ListboxProps={{
                                style: {
                                    ...selectListBoxCSS,
                                    textTransform: 'capitalize'
                                }
                            }}
                            style={{ textTransform: 'capitalize' }}
                        />

                        <OcrTemplateSelector
                            listBoxCSS={selectListBoxCSS}
                        />
                        
                    </Container>

                    <Typography fontSize='1.08rem' lineHeight={2} ml={1} mb={0} mt={'56px'}
                        sx={{ fontWeight: 600 }}
                    >
                        ✨New features:
                    </Typography>
                    <ul
                        style={{
                            fontSize: '1rem',
                            color: 'lightgray',
                            lineHeight: 2,
                            marginTop: 0,
                            marginLeft: 15
                        }}
                    >
                        <li>
                            <strong> MangaOCR integration. </strong>
                        </li>

                        <li>
                            <strong> Initial support for macOS. </strong>
                        </li>

                        <li>
                            <strong> Apple's Vision Framework OCR engine integration (macOS only). </strong>
                        </li>

                        <li>
                            <strong> Auto OCR (OCR Templates): </strong>
                            Monitors your screen and automatically runs OCR whenever it detects meaningful changes.
                        </li>

                        <li>
                            <strong> Text-to-Speech (OCR Templates). </strong>
                        </li>

                        <li>
                            <strong> System tray icon. </strong>
                        </li>

                        <li> 
                            <strong> Overlay Adjustment Option: </strong>
                            You can now manually move or resize the overlay either from the tray icon or by pressing <strong>Ctrl+Shift+M</strong>. 
                        </li>

                        <li>
                            <strong> Added PaddleOCR languages: </strong> Chinese (traditional), Latin, and Cyrillic. 
                        </li>
                        {/* <li> Clipboard options menu (WIP) </li> */}
                    </ul>

                </CardContent>
            </Card>
            
            
            <Card variant="elevation" sx={{ borderRadius: 4, pl: 1, pr: 1  }}>

                <CardContent>

                    <Typography mb={7} mt={1} fontSize='1.2rem'>
                        The overlay can be operated by using the following hotkeys <br/>                        
                    </Typography>

                    <HotkeyHints/>

                    <ul
                        style={{
                            fontSize: '1.0rem',
                            color: 'lightgray',
                            lineHeight: 2,
                            marginTop: 56,
                        }}
                    >
                        <li>Achieve the lowest latency by using the "PrintScreen" key.</li>
                        <li>Customize hotkeys, text auto-copy, and more in the settings menu.</li>
                        <li>The copied text is also transmitted via WebSockets on port 6677.</li>
                        <li>If the game hides the mouse cursor, enable the custom cursor in the settings menu.</li>
                        <li>Edit extracted text with Ctrl + Double Click. </li>
                    </ul>

                </CardContent>

            </Card>
        
            
        </Box>
        
    )
}