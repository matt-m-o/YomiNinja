import { Container, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, SxProps, TextField, Theme, Typography, debounce } from "@mui/material";
import { useContext } from "react";
import { SettingsContext } from "../../../context/settings.provider";
import { OverlayOcrItemBoxVisuals, TextPositioningMode } from "../../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
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

        <Container sx={{ ml: 1.5,  mt: 2, mb: 1 }}>
            <FormControl fullWidth 
                sx={{
                    display:'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: 300
                }}>
                
                <Select
                    value={ ocrItemBoxVisuals?.text?.positioning?.mode || '' }
                    label="Positioning Mode"
                    onChange={ ( event ) => {
                        const { value } = event.target;
                        if (typeof value === 'string') {
                            updateOcrItemBoxVisuals({
                                text: {
                                    ...ocrItemBoxVisuals.text,
                                    positioning: {
                                        ...ocrItemBoxVisuals.text?.positioning,
                                        mode: value as TextPositioningMode
                                    }
                                }
                            });
                        }
                    }}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value='line-based'>
                        Line-based
                    </MenuItem>
                    <MenuItem value='word-based'>
                        Word-based
                    </MenuItem>
                    <MenuItem value='character-based'>
                        Character-based
                    </MenuItem>
                </Select>

                <InputLabel>Positioning Mode</InputLabel>

            </FormControl>
            
        </Container>
            
        <Container sx={{ ml: 1.5,  mt: 0, mb: 0 }}>
            <FormControlLabel label='Add end-of-sentence punctuation'
                title="Fixes Yomitan sentence mining issues"
                control={
                    <Switch
                        checked={ Boolean( ocrItemBoxVisuals?.text?.sentence_ending_punctuation?.enabled ) }
                        onChange={ ( event ) => {
                            updateOcrItemBoxVisuals({
                                text: {
                                    ...ocrItemBoxVisuals.text,
                                    sentence_ending_punctuation: {
                                        ...ocrItemBoxVisuals.text.sentence_ending_punctuation,
                                        enabled: event.target.checked
                                    }
                                }
                            });
                        }}
                    /> 
                }
            />

            <FormControlLabel label='Invisible'
                title="Hide the added punctuation"
                control={
                    <Switch
                        disabled={ !Boolean( ocrItemBoxVisuals?.text?.sentence_ending_punctuation?.enabled ) }
                        checked={ Boolean( ocrItemBoxVisuals?.text?.sentence_ending_punctuation?.hidden ) }
                        onChange={ ( event ) => {
                            updateOcrItemBoxVisuals({
                                text: {
                                    ...ocrItemBoxVisuals.text,
                                    sentence_ending_punctuation: {
                                        ...ocrItemBoxVisuals.text.sentence_ending_punctuation,
                                        hidden: event.target.checked
                                    }
                                }
                            });
                        }}
                    /> 
                }
            />
        </Container>

        <Container sx={{ ml: 1.5,  mt: 0, mb: 2 }}>
            <FormControlLabel label='Filter out furigana'
                title='Removes pieces of text that can potentially be furigana (experiemental)'
                control={
                    <Switch
                        checked={ Boolean( ocrItemBoxVisuals?.text?.furigana_filter?.enabled ) }
                        onChange={ ( event ) => {
                            updateOcrItemBoxVisuals({
                                text: {
                                    ...ocrItemBoxVisuals.text,
                                    furigana_filter: {
                                        ...ocrItemBoxVisuals.text.furigana_filter,
                                        enabled: event.target.checked
                                    }
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