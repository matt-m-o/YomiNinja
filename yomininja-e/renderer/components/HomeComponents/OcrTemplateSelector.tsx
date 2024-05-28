import { Autocomplete, FormControlLabel, SxProps, TextField, TextFieldProps, Theme } from "@mui/material";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import { CSSProperties, useContext } from "react";
import CustomTextField from "./CustomTextField";
import ViewComfyRoundedIcon from '@mui/icons-material/ViewComfyRounded';


export default function OcrTemplateSelector( props: { listBoxCSS?: CSSProperties } ) {

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
                return <TextField {...params}
                    label='OCR Template'
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: <ViewComfyRoundedIcon sx={{ mr: '10px' }}/>,
                        style: {
                            paddingLeft: '14px'
                        }
                    }}
                />
            }}
            value={ activeOcrTemplate?.name || 'None' }
            onChange={( event: any, newValue: string | null ) => {
                handleSelectChange( newValue );
            }}
            options={ selectOptions }
            sx={{ mb: '25px' }}
            ListboxProps={{ style: props.listBoxCSS }}
        />
    )
}