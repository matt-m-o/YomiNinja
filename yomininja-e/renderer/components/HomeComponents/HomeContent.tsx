import { CSSProperties, useContext, useEffect } from "react"
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

function capitalize( text: string ) {
    return text?.charAt(0).toUpperCase() + text?.slice(1);
}

export default function HomeContent() {

    const { languages } = useContext( LanguagesContext );
    const {
        profile,
        changeActiveOcrLanguage,
        changeSelectedOcrEngine
    } = useContext( ProfileContext );

    const { activeCaptureSource } = useContext( CaptureSourceContext );

    const activeOcrLanguage: string = capitalize( profile?.active_ocr_language.name ) || '';
    const languageOptions: string[] = languages?.map( language => capitalize(language.name) );

    // Adapter name : Engine name
    const ocrEnginesDict = {
        'PpOcrAdapter': 'PaddleOCR',
        'CloudVisionOcrAdapter': 'Google Cloud Vision',
        'GoogleLensOcrAdapter': 'Google Lens'
    };
    
    const ocrEngineOptions: string[] = Object.values( ocrEnginesDict );

    let selectedOcrEngine: string = ocrEnginesDict[ profile?.selected_ocr_adapter_name ] || '';


    function handleLanguageSelectChange( languageName: string ) {

        if (!languageName) return;

        const language = languages?.find( language => language.name === languageName.toLowerCase() );

        if ( !language ) return;
        
        changeActiveOcrLanguage( language );
    }

    function openCaptureSourceSelectionWindow() {
        global.ipcRenderer.invoke('main:show_capture_source_selection');
    }

    function handleOcrEngineSelection( selectedEngineName: string ) {
        
        Object.entries( ocrEnginesDict )
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
                                return <TextField {...params}
                                    label='OCR Language'
                                    fullWidth
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: <TranslateOutlinedIcon sx={{ mr: '10px' }}/>,
                                        style: {
                                            paddingLeft: '14px'
                                        }
                                    }}
                                />
                            }}
                            value={ activeOcrLanguage || '' }
                            onChange={( event: any, newValue: string | null ) => {
                                handleLanguageSelectChange( newValue );
                            }}
                            options={ languageOptions || [] }
                            sx={{ mb: '25px' }}
                            ListboxProps={{ style: selectListBoxCSS }}
                        />

                        <OcrTemplateSelector
                            listBoxCSS={selectListBoxCSS}
                        />
                        
                    </Container>

                    <Typography fontSize='1rem' lineHeight={2} ml={1} mb={0} mt={'56px'}>
                        ✨New features:
                    </Typography>
                    <ul
                        style={{
                            fontSize: '1rem',
                            color: 'lightgray',
                            lineHeight: 2,
                            marginTop: 0,
                            marginLeft: 20
                        }}
                    >
                        <li> Google Lens integration. </li>
                        <li> Google Cloud Vision integration. </li>
                        <li> Individual character positioning for accurate text overlay (currently exclusive to Cloud Vision). </li>
                        <li> Expanded PaddleOCR settings menu with additional parameters. </li>
                        <li> Native support for Yomitan, Yomichan, and JPDB extensions. </li>
                        <li> Global hotkeys for toggling the overlay and coping extracted text. </li>
                        <li> Dedicated global hotkeys for each OCR engine. </li>
                        <li> Edit extracted text with Ctrl + Double Click, allowing for manual corrections. </li>
                        <li> Enhanced overlay customization options. </li>
                        <li> Option to automatically hide OCR results upon focus loss. </li>

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