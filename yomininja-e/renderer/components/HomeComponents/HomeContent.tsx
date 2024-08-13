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
import { AppInfoContext } from "../../context/app_info.provider";
import { ipcRenderer } from "../../utils/ipc-renderer";
import { isElectronBrowser, isInPWAMode, onDisplayModeChange } from "../../utils/environment";

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
    const { systemInfo } = useContext( AppInfoContext );
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
    const [ overlayLink, setOverlayLink ] = useState<string>();
    const [ isPWA, setIsPWA ] = useState(false);

    const ocrEngineOptions = Object.values( supportedOcrEngines );
    const selectedOcrEngine = supportedOcrEngines[ profile?.selected_ocr_adapter_name ] || '';

    useEffect( () => {
        getSupportedOcrEngines()
            .then( dict => {
                setSupportedOcrEngines( dict );
            });
        
        if ( location.href.endsWith('index.html') )
            setOverlayLink( location.href.replace('index', 'ocr-overlay-browser') );
        else
            setOverlayLink( location.href + "ocr-overlay-browser.html" );

        setIsPWA( isInPWAMode( window ) );

        const off = onDisplayModeChange( window, ( mode ) => {
            setIsPWA( isInPWAMode( window ) );
        });

        return () => {
            off();
        };
    }, [] );

    function handleLanguageSelectChange( selectedName: string ) {

        if (!selectedName) return;

        const language = languages?.find(
            language => language.name.toLowerCase() === selectedName.toLowerCase()
        );

        if ( !language ) return;
        
        changeActiveOcrLanguage( language );
    }

    function openCaptureSourceSelectionWindow() {
        ipcRenderer.invoke('main:show_capture_source_selection');
    }

    async function getSupportedOcrEngines(): Promise< { [key: string]: string; } > {
        const result = await ipcRenderer.invoke( 'ocr_recognition:get_supported_ocr_engines' ) as { [key: string]: string; };
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

    function viewOverlayInBrowser() {

        if ( isPWA && window ) {
            const { screenLeft, screenTop } = window;
            const {  } = screen;
            const windowFeatures = `left=${screenLeft},top=${screenTop},width=${1200},height=${700},titlebar=no,location=0`;
            const overlayWindow = window.open(
                overlayLink,
                "overlayWindow",
                windowFeatures
            );
            return;
        }

        if ( isElectronBrowser() ) {
            console.log({ overlayLink })
            ipcRenderer.invoke( 'open_link', overlayLink );
        }
    }

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
                                console.log(newValue)
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

                        <Button variant="outlined" title="experimental"
                            href= { !isElectronBrowser() && !isPWA && overlayLink }
                            target="_blank"
                            fullWidth
                            onClick={ viewOverlayInBrowser }
                        >
                            View Overlay in  Your Browser
                        </Button>
                        
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

                        { systemInfo?.platform === 'darwin' &&
                            <li>
                                <strong> MangaOCR integration. </strong>
                            </li>
                        }

                        <li>
                            <strong> Comic Text Detector (MangaOCR only). </strong>
                        </li>

                        <li>
                            <strong> The positioning and sizing of extracted text have been improved. </strong>
                        </li>

                        <li>
                            <strong> Option to filter out extracted furigana. </strong>
                        </li>

                        <li>
                            <strong> Option to automatically append ending punctuation marks to the extracted text to avoid potential sentence-mining issues. </strong>
                        </li>

                        <li>
                            <strong> Option to switch text positioning modes (Block-based, Line-based, Word-based, or Character-based). </strong>
                        </li>

                        <li>
                            <strong> Option to control the visibility of furigana generated by extensions. </strong>
                        </li>

                        <li>
                            <strong> Option to run YomiNinja at system startup. </strong>
                        </li>

                        <li>
                            <strong> Option to disable hardware acceleration, potentially solving the issue where the overlay turns black.</strong>
                        </li>

                        <li>
                            <strong> Button to restore default hotkeys. </strong>
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
                        <li>Achieve the lowest latency by using the <strong>PrintScreen</strong> key.</li>
                        <li>Customize hotkeys, text auto-copy, and more in the settings menu.</li>
                        <li>The copied text is also transmitted via WebSockets on port 6677.</li>
                        <li>If the game hides the mouse cursor, enable the custom cursor in the settings menu.</li>
                        <li>Edit extracted text with <strong>Ctrl + Double Click</strong>. </li>
                    </ul>

                </CardContent>

            </Card>
        
            
        </Box>
        
    )
}