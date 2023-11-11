import { useContext, useEffect } from "react"
import { LanguagesContext } from "../../context/languages.provider";
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, Card, CardActions, CardContent, Container, FormControlLabel, FormGroup, Grid, TextField, TextFieldProps, Typography } from "@mui/material";
import { ProfileContext } from "../../context/profile.provider";
import CaptureSourceMenu from "./CaptureSourceMenu";
import { CaptureSourceContext, CaptureSourceProvider } from "../../context/capture_source.provider";
import HotkeyHints from "./HotkeyHints";
import { ScreenshotMonitorRounded } from "@mui/icons-material";
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';



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


    function CustomTextField( props: { label?: string, width?: string } & TextFieldProps ) {
        return (
            <FormControlLabel label={props.label}
                sx={{
                    alignItems: 'start',
                }}
                labelPlacement="top"
                control={
                    <TextField {...props } label='' sx={{ width: props.width }}/>
                }
            />
        )
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
                                        }}
                                    >                
                                        <Typography color='#90caf9' fontSize='0.85rem' >
                                            {activeCaptureSource?.name}
                                        </Typography>
                                    </Button>
                                }
                            />
                        </Grid>
                        
                        <Grid item>                        
                            <Autocomplete autoHighlight
                                renderInput={ (params) => {
                                    return <CustomTextField {...params} label='OCR language' width='200px' />
                                }}
                                value={ activeOcrLanguage || 'english' }
                                onChange={(event: any, newValue: string | null) => {
                                    handleLanguageSelectChange( newValue );
                                }}
                                options={ languageOptions || [] }
                            />
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
                        <li> Built-in popup dictionaries. </li>
                        <li> WebSocket for texthookers. Port: 6677.</li>
                        <li> Copy text on click. (only with Click-through disabled for now). </li>
                        <li> Option to alter the OCR inference runtime. This might be helpful for those experiencing issues with OCR functionality. </li>
                    </ul>

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
                        <li> Option to invert the captured image colors. Good for text on a dark background.</li>
                        <li> WebSocket for texthookers. Port: 6677.</li>
                        <li> Option to alter the OCR inference runtime. This might be helpful for those experiencing issues with OCR functionality. </li>
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
                    </ul>

                </CardContent>

            </Card>
        
            
        </Box>
        
    )
}