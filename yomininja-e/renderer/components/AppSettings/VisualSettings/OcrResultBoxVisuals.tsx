import { Container, FormControlLabel, Switch, SxProps, TextField, Theme, Typography, debounce } from "@mui/material";
import { useContext } from "react";
import { SettingsContext } from "../../../context/settings.provider";
import { OverlayOcrItemBoxVisuals } from "../../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import ColorPicker from "../../common/ColorPicker";


type OcrResultBoxVisualSettingsProps = {
    textFieldSx: SxProps< Theme >
}

export default function OcrResultBoxVisualSettings( props: OcrResultBoxVisualSettingsProps ) {

    const { textFieldSx } = props;

    const { activeSettingsPreset, updateActivePresetVisuals } = useContext( SettingsContext );

    const ocrItemBoxVisuals: OverlayOcrItemBoxVisuals = activeSettingsPreset?.overlay?.visuals.ocr_item_box;

    const updateOcrItemBoxVisuals = debounce( ( update: Partial< OverlayOcrItemBoxVisuals>  ) => {    
        updateActivePresetVisuals({
            ocr_item_box: {
                ...activeSettingsPreset.overlay.visuals.ocr_item_box,
                ...update
            }
        });
    }, 100 );


    return ( <>
        <Typography gutterBottom component="div" mb={1} fontSize='1.1rem'>
            Extracted text
        </Typography>

        <Container sx={{ ml: 1.5,  mt: 0, mb: 2 }}>
            <FormControlLabel label='Individual character positioning (not supported by all OCR engines)'
                title="Currently only supported by Google Cloud Vision. Breaks JPDB Reader."
                control={
                    <Switch
                        checked={ Boolean( ocrItemBoxVisuals?.text.character_positioning ) }
                        onChange={ ( event ) => {
                            updateOcrItemBoxVisuals({
                                text: {
                                    ...ocrItemBoxVisuals.text,
                                    character_positioning: event.target.checked
                                }
                            });
                        }}
                    /> 
                }
            />
        </Container>

        <Container sx={{ mt: 0, mb: 2 }}>

            <ColorPicker label="Text Color" sx={textFieldSx}
                value={ ocrItemBoxVisuals?.text.color || '' }
                onChangeComplete={ (color) => {
                    updateOcrItemBoxVisuals({                                
                        text: {
                            ...ocrItemBoxVisuals?.text,
                            color
                        }
                    });
                }}
            />

            <ColorPicker label="Outline Color" sx={textFieldSx}
                value={ ocrItemBoxVisuals?.text.outline_color || '' }
                onChangeComplete={ (color) => {
                    updateOcrItemBoxVisuals({                                
                        text: {
                            ...ocrItemBoxVisuals?.text,
                            outline_color: color
                        }
                    });
                }}
            />

            <TextField label="Font Size (%)" sx={textFieldSx}                      
                size='small'
                type="number"
                inputProps={{ style: { textAlign: 'center' } }}
                value={ ocrItemBoxVisuals?.text.font_size_factor || 100 }
                onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                    updateOcrItemBoxVisuals({                                
                        text: {
                            ...ocrItemBoxVisuals?.text,
                            font_size_factor: Number( event.target.value )
                        }
                    });
                }}
            />

            <TextField label="Font Weight"
                size='small'
                type="number"
                inputProps={{ style: { textAlign: 'center' } }}
                value={ ocrItemBoxVisuals?.text.font_weight / 100 || 5 }
                onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                    const value = Number( event.target.value );
                    if ( value > 10 || value < 1 ) return;
                    updateOcrItemBoxVisuals({                                
                        text: {
                            ...ocrItemBoxVisuals?.text,
                            font_weight: Number( event.target.value ) * 100
                        }
                    });
                }}
                sx={{ ...textFieldSx, width: 'min-content'}}
            />

            <TextField label="Letter Spacing" sx={textFieldSx}                      
                size='small'
                type="number"
                inputProps={{ style: { textAlign: 'center' } }}
                value={ ocrItemBoxVisuals?.text.letter_spacing || 0 }
                onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                    updateOcrItemBoxVisuals({                                
                        text: {
                            ...ocrItemBoxVisuals?.text,
                            letter_spacing: Number( event.target.value )
                        }
                    });
                }}
            />

            <TextField label="Outline Width" sx={textFieldSx}                      
                size='small'
                type="number"
                inputProps={{ style: { textAlign: 'center' } }}
                value={ ocrItemBoxVisuals?.text.outline_width || 0 }
                onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                    updateOcrItemBoxVisuals({                                
                        text: {
                            ...ocrItemBoxVisuals?.text,
                            outline_width: Number( event.target.value )
                        }
                    });
                }}
            />
            
        </Container>

        <Typography gutterBottom component="div" mb={1} fontSize='1.1rem'
            title='Some extensions might override this settings'
        >
            Highlighted text
        </Typography>

        <Container sx={{ mt: 0, mb: 2 }}>

            <ColorPicker label="Text Color" sx={textFieldSx}
                value={ ocrItemBoxVisuals?.selected_text?.color || '' }
                onChangeComplete={ (color) => {
                    updateOcrItemBoxVisuals({                                
                        selected_text: {
                            ...ocrItemBoxVisuals?.selected_text,
                            color
                        }
                    });
                }}
            />

            <ColorPicker label="Highlight Color" sx={textFieldSx}
                value={ ocrItemBoxVisuals?.selected_text?.background_color || '' }
                onChangeComplete={ (color) => {
                    updateOcrItemBoxVisuals({                                
                        selected_text: {
                            ...ocrItemBoxVisuals?.selected_text,
                            background_color: color
                        }
                    });
                }}
            />

        </Container>

        <Typography gutterBottom component="div" mb={1} fontSize='1.1rem'>
            Bounding box
        </Typography>

        <Container sx={{ mt: 0, mb: 2 }}>

            <ColorPicker label="Inactive BG"
                value={ ocrItemBoxVisuals?.background_color_inactive || '' }
                onChangeComplete={ ( color: string ) => {
                    updateOcrItemBoxVisuals({
                        background_color_inactive: color
                    });
                }}
                sx={{ ...textFieldSx, minWidth: '90px' }}
            />

            <ColorPicker label="Active BG"
                value={ ocrItemBoxVisuals?.background_color || '' }
                onChangeComplete={ ( color: string ) => {
                    updateOcrItemBoxVisuals({
                        background_color: color
                    });
                }}
                sx={{ ...textFieldSx, minWidth: '85px' }}
            />

            <ColorPicker label="Inactive Border"
                value={ ocrItemBoxVisuals?.inactive_border_color || '' }
                onChangeComplete={ ( color: string ) => {
                    updateOcrItemBoxVisuals({
                        inactive_border_color: color
                    });
                }}
                sx={{ ...textFieldSx, minWidth: '110px' }}
            />

            <ColorPicker label="Active Border" sx={textFieldSx}
                value={ ocrItemBoxVisuals?.active_border_color || '' }
                onChangeComplete={ ( color: string ) => {
                    updateOcrItemBoxVisuals({                                
                        active_border_color: color
                    });
                }}
            />

            <TextField label="Border Width" sx={textFieldSx}
                title='Border Width'                     
                size='small'
                type="number"
                inputProps={{ style: { textAlign: 'center' } }}                        
                value={ ocrItemBoxVisuals?.border_width || '' }
                onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                    updateOcrItemBoxVisuals({                                
                        border_width: Number(event.target.value)
                    });
                }}
            />

            <TextField label="Border Radius" sx={textFieldSx}
                title='Border Radius'
                size='small'
                type="number"
                inputProps={{ style: { textAlign: 'center' } }}                        
                value={ ocrItemBoxVisuals?.border_radius || '' }
                onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                    updateOcrItemBoxVisuals({                                
                        border_radius: Number(event.target.value)
                    });
                }}
            />

            <TextField label="Size Offset (%)" sx={textFieldSx}                      
                size='small'
                type="number"                        
                inputProps={{ style: { textAlign: 'center' } }}                        
                value={ ocrItemBoxVisuals?.size_factor || 1 }
                onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                    updateOcrItemBoxVisuals({                                
                        size_factor: Number(event.target.value)
                    });
                }}
            />

        </Container>
    </> )
}