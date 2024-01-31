import { Autocomplete, FormControlLabel, SxProps, TextField, TextFieldProps, Theme } from "@mui/material";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import { useContext } from "react";
import CustomTextField from "./CustomTextField";



export default function OcrTemplateSelector() {

    const {
        ocrTemplates,
        activeOcrTemplate,
        loadOcrTemplate,
        unloadOcrTemplate,
    } = useContext( OcrTemplatesContext );


    function handleSelectChange( name?: string ) {

        if ( !name ) name = 'None';

        name = name.toLowerCase();

        if ( name === 'none' )
            unloadOcrTemplate();

        const template = ocrTemplates.find(
            template => template.name.toLowerCase() === name
        );

        if ( !template ) return;

        loadOcrTemplate( template.id );
    }

    const selectOptions = [
        'None',
        ...ocrTemplates?.map( item => item.name ) || []
    ];
    

    return (
        <Autocomplete autoHighlight
            fullWidth
            renderInput={ (params) => {
                return <CustomTextField {...params}
                    label='OCR Template'
                    sx={{
                        minWidth: '275px',
                    }}
                />
            }}
            value={ activeOcrTemplate?.name || 'None' }
            onChange={( event: any, newValue: string | null ) => {
                handleSelectChange( newValue );
            }}
            options={ selectOptions }
        />
    )
}