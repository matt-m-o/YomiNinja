import { useContext, useEffect } from "react"
import { LanguagesContext } from "../../context/languages.provider";
import { Autocomplete, Box, Button, Card, CardContent, Container, FormControlLabel, Grid, SxProps, TextField, TextFieldProps, Theme, Typography } from "@mui/material";
import { ProfileContext } from "../../context/profile.provider";
import { CaptureSourceContext, CaptureSourceProvider } from "../../context/capture_source.provider";
import HotkeyHints from "./HotkeyHints";
import { ScreenshotMonitorRounded } from "@mui/icons-material";
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import OcrTemplateSelector from "./OcrTemplateSelector";
import CustomTextField from "./CustomTextField";



function capitalize( text: string ) {
    return text?.charAt(0).toUpperCase() + text?.slice(1);
}

export default function HomeContent() {

    const { languages } = useContext( LanguagesContext );
    const { profile, changeActiveOcrLanguage } = useContext( ProfileContext );

    const { activeCaptureSource } = useContext( CaptureSourceContext );


    const activeOcrLanguage: string = capitalize(profile?.active_ocr_language.name);
    
    const languageOptions: string[] = languages?.map( language => capitalize(language.name) );

    function handleLanguageSelectChange( languageName: string ) {

        if (!languageName) return;

        const language = languages?.find( language => language.name === languageName.toLowerCase() );

        if ( !language ) return;
        
        changeActiveOcrLanguage( language );
    }


    function openCaptureSourceSelectionWindow() {
        global.ipcRenderer.invoke('main:show_capture_source_selection');
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

                    <Grid container justifyContent="center" spacing={{ xs: 2, md: 2 }} columns={{ xs: 1, sm: 4, md: 12 }} sx={{ flexGrow: 1  }} >
                    
                        <Grid item>
                            <FormControlLabel label={'Capture source'}
                                sx={{
                                    alignItems: 'start',
                                }}
                                labelPlacement="top"
                                control={
                                    <Button variant="outlined" size="large"
                                        startIcon={<ScreenshotMonitorRounded/>}
                                        endIcon={ <MoreVertRoundedIcon/> }
                                        onClick={ openCaptureSourceSelectionWindow }
                                        sx={{
                                            width: 'max-content',
                                            height: '56px',
                                            textTransform: 'none'                  
                                        }}
                                    >                
                                        <Typography color='#90caf9'>
                                            {activeCaptureSource?.name}
                                        </Typography>
                                    </Button>
                                }
                            />
                        </Grid>
                        
                        <Grid item>
                            <Autocomplete autoHighlight
                                renderInput={ (params) => {
                                    return <CustomTextField {...params}
                                        label='OCR language'
                                        sx={{ width: '177px' }}
                                    />
                                }}
                                value={ activeOcrLanguage || '' }
                                onChange={( event: any, newValue: string | null ) => {
                                    handleLanguageSelectChange( newValue );
                                }}
                                options={ languageOptions || [] }
                            />
                        </Grid>
                            
                        
                        <Grid item>
                            <OcrTemplateSelector/>
                        </Grid>

                    </Grid>                    

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
                        <li> Chrome Extensions Manager. </li>
                        <li> OCR Templates. </li>
                        <li> Option to control which window is displayed when the text is copied (e.g. Yomichan, Yomitan, Yomibaba...). </li>
                        <li> Option to enable a custom mouse cursor for games that hide the mouse cursor. </li>
                        <li> Option to change the overlay font size. </li>
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
                    </ul>

                </CardContent>

            </Card>
        
            
        </Box>
        
    )
}