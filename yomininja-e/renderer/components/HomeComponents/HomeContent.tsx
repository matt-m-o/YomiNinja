import { useContext, useEffect } from "react"
import { LanguagesContext } from "../../context/languages.provider";
import { Autocomplete, Box, Container, TextField } from "@mui/material";
import { ProfileContext } from "../../context/profile.provider";


function capitalize( text: string ) {
    return text?.charAt(0).toUpperCase() + text?.slice(1);
}

export default function HomeContent() {

    const { languages } = useContext( LanguagesContext );
    const { profile, changeActiveOcrLanguage } = useContext( ProfileContext );


    const activeOcrLanguage: string = capitalize(profile?.active_ocr_language.name);
    
    const languageOptions: string[] = languages?.map( language => capitalize(language.name) );

    function handleLanguageSelectChange( languageName: string ) {

        console.log({ languageName });

        const language = languages?.find( language => language.name === languageName.toLowerCase() );

        if ( !language ) return;
        
        changeActiveOcrLanguage( language );
    }




    return (
        <>
            <Box display='flex' justifyContent='center'>

                <Autocomplete autoHighlight                    
                    renderInput={ (params) => {
                        return <TextField {...params}  />
                    }}
                    value={ activeOcrLanguage || 'english' }
                    onChange={(event: any, newValue: string | null) => {
                        handleLanguageSelectChange( newValue );
                    }}                    
                    options={ languageOptions || [] }
                    sx={{ width: 190 }}                
                />

            </Box>
        </>
    )
}