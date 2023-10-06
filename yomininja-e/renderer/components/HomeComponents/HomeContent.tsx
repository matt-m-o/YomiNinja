import { useContext, useEffect } from "react"
import { LanguagesContext } from "../../context/languages.provider";
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Container, FormControlLabel, FormGroup, TextField, TextFieldProps, Typography } from "@mui/material";
import { ProfileContext } from "../../context/profile.provider";
import CaptureSourceMenu from "./CaptureSourceMenu";
import { CaptureSourceProvider } from "../../context/capture_source.provider";



function capitalize( text: string ) {
    return text?.charAt(0).toUpperCase() + text?.slice(1);
}

export default function HomeContent() {

    const { languages } = useContext( LanguagesContext );
    const { profile, changeActiveOcrLanguage } = useContext( ProfileContext );


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
                    // minWidth: '150px',
                    // width: 'max-content',
                    // maxWidth: props.width,
                    alignItems: 'start',
                    ml: '10px',
                    mr: '10px'
                }}
                labelPlacement="top"                
                control={
                    <TextField {...props } label='' sx={{ width: props.width }}/>
                }
            />
        )        
    }


    return (
        
        <Box display='flex' justifyContent='center' flexDirection='column' maxWidth={800} m={'auto'}>

            <Box display='flex' justifyContent='center' flexDirection='row'> 
                <Autocomplete autoHighlight
                    renderInput={ (params) => {
                        return <CustomTextField {...params} label='OCR Language' width='200px' />
                    }}
                    value={ activeOcrLanguage || 'english' }
                    onChange={(event: any, newValue: string | null) => {
                        handleLanguageSelectChange( newValue );
                    }}
                    options={ languageOptions || [] }
                />                
            </Box>
                
            <CaptureSourceProvider>
                <CaptureSourceMenu/>
            </CaptureSourceProvider>
            
        </Box>
        
    )
}