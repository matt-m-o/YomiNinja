import { Box, Container, Divider, FormControlLabel, FormGroup, Slider, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useCallback, useContext, useEffect, useState } from "react";
import { OverlayFrameVisuals, OverlayMouseVisuals, OverlayOcrItemBoxVisuals, OverlayVisualCustomizations } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import { throttle } from "lodash";
import CustomCursor from "../OcrOverlay/CustomCursor/CustomCursor";


const OverlayFrame = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '320px',
    height: '180px',
    padding: '10px',
});

const OcrItemBox = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content',
    height: '40px',
    padding: '10px',    
});

// Settings section component
export default function AppSettingsVisuals() {

    const { activeSettingsPreset, updateActivePresetVisuals } = useContext( SettingsContext );


    const ocrItemBoxVisuals: OverlayOcrItemBoxVisuals = activeSettingsPreset?.overlay?.visuals.ocr_item_box;
    const overlayFrameVisuals: OverlayFrameVisuals = activeSettingsPreset?.overlay?.visuals.frame;
    const overlayMouseVisuals: OverlayMouseVisuals = activeSettingsPreset?.overlay?.visuals.mouse;

    const [ mouseSize, setMouseSize ] = useState<number>( overlayMouseVisuals?.custom_cursor_size || 30 );

    useEffect( () => {

        if ( !overlayMouseVisuals ) return;

        console.log( overlayMouseVisuals )

        setMouseSize( overlayMouseVisuals.custom_cursor_size );

    }, [ overlayMouseVisuals ] )

    const updateOcrItemBoxVisuals = debounce( ( update: Partial<OverlayOcrItemBoxVisuals> ) => {    
        updateActivePresetVisuals({
            ocr_item_box: {
                ...activeSettingsPreset.overlay.visuals.ocr_item_box,
                ...update
            }
        });
    }, 100 );

    const updateOverlayFrameVisuals = debounce( ( update: Partial<OverlayFrameVisuals> ) => {
        updateActivePresetVisuals({
            frame: {
                ...activeSettingsPreset.overlay.visuals.frame,
                ...update
            }
        });
    }, 100 );

    const updateOverlayMouseVisuals = debounce( ( update: Partial< OverlayMouseVisuals > ) => {

        if ( update.custom_cursor_size < 1 )
            update.custom_cursor_size = 1;
        else if ( update.custom_cursor_size > 100 )
            update.custom_cursor_size = 100;

        updateActivePresetVisuals({
            mouse: {
                ...activeSettingsPreset.overlay.visuals.mouse,
                ...update
            }
        });
    }, 100 );
    
    const textFieldBaseSx: SxProps<Theme> = {
        minWidth: '100px', 
        maxWidth: '110px',
        m: 1,
    };    
    

    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                Overlay Appearance
            </Typography>
            
            <Container sx={{ mt: 2, mb: 2 }}>

                <Typography gutterBottom component="div" mb={1} fontSize='1.1rem'>
                    Extracted text boxes
                </Typography>

                <Container sx={{ mt: 0, mb: 2 }}>

                    <TextField label="Background color" sx={textFieldBaseSx}                      
                        size='small'
                        type="color"
                        inputProps={{ style: { textAlign: 'center' } }}                        
                        value={ ocrItemBoxVisuals?.background_color || '' }
                        onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                            updateOcrItemBoxVisuals({
                                background_color: event.target.value
                            });                            
                        }}
                    />

                    <TextField label="Text color" sx={textFieldBaseSx}                      
                        size='small'
                        type="color"
                        inputProps={{ style: { textAlign: 'center' } }}
                        value={ ocrItemBoxVisuals?.text.color || '' }
                        onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                            updateOcrItemBoxVisuals({                                
                                text: {
                                    ...ocrItemBoxVisuals?.text,
                                    color: event.target.value
                                }
                            });
                        }}
                    />

                    <TextField label="Font size (%)" sx={textFieldBaseSx}                      
                        size='small'
                        type="number"
                        inputProps={{ style: { textAlign: 'center' } }}
                        value={ 
                            ocrItemBoxVisuals?.text.font_size_factor || 100 }
                        onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                            updateOcrItemBoxVisuals({                                
                                text: {
                                    ...ocrItemBoxVisuals?.text,
                                    font_size_factor: Number( event.target.value )
                                }
                            });
                        }}
                    />

                    <TextField label="Border color" sx={textFieldBaseSx}                      
                        size='small'
                        type="color"
                        inputProps={{ style: { textAlign: 'center' } }}                        
                        value={ ocrItemBoxVisuals?.border_color || '' }
                        onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                            updateOcrItemBoxVisuals({                                
                                border_color: event.target.value
                            });
                        }}
                    />

                    <TextField label="Border width" sx={textFieldBaseSx}                        
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

                    <TextField label="Border Radius" sx={textFieldBaseSx}                      
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
                    
                </Container>

                

                <Typography gutterBottom component="div" mb={1} fontSize='1.1rem'>
                    Overlay frame
                </Typography>

                <Container sx={{ mt: 0, mb: 2 }}>

                    <TextField label="Border color" sx={textFieldBaseSx}
                        size='small'
                        type="color"                        
                        inputProps={{ style: { textAlign: 'center' } }}                        
                        value={ overlayFrameVisuals?.border_color || 0 }
                        onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                            updateOverlayFrameVisuals({                                
                                border_color: event.target.value
                            });
                        }}
                    />

                    <TextField label="Border width" sx={textFieldBaseSx}                      
                        size='small'
                        type="number"
                        inputProps={{ style: { textAlign: 'center' } }}                        
                        value={ overlayFrameVisuals?.border_width || '' }
                        onInput={ (event: React.ChangeEvent<HTMLInputElement>) => {
                            updateOverlayFrameVisuals({                                
                                border_width: Number(event.target.value)
                            });
                        }}
                    />

                </Container>
                

                <Typography gutterBottom component="div" mb={1} fontSize='1.1rem'>
                    Mouse cursor
                </Typography>
                
                <Container
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        mt: 0,
                        mb: 2
                    }}
                >

                    <Typography gutterBottom component="div" mb={1} fontSize='0.9rem'>
                        This is a workaround for applications that hide the mouse cursor.
                    </Typography>

                    <FormControlLabel label='Show custom mouse cursor'
                        control={
                            <Switch
                                checked={ Boolean( overlayMouseVisuals?.show_custom_cursor ) }
                                onChange={ ( event ) => {
                                    updateOverlayMouseVisuals({
                                        show_custom_cursor: event.target.checked
                                    });
                                }}
                            /> 
                        }
                    />

                    <Box display={'flex'} flexDirection={'row'} >
                        <Typography gutterBottom component="div" margin={2} mb={1} ml={0} mr={0.4} fontSize={'1rem'}>
                            Custom cursor size
                        </Typography>
                    </Box>

                    <Stack spacing={2} direction="row" sx={{ mb: 1, pl: 2, pr: 2 }} alignItems="center">

                        <Slider
                            marks
                            min={1}
                            max={ 100 }
                            step={1}
                            valueLabelDisplay="auto"
                            value={ mouseSize  }
                            style={{ marginRight: 8 }}                
                            onChange={ ( event, newValue ) => {
                                if (typeof newValue === 'number') {
                                    setMouseSize( newValue );
                                }
                            }}
                            onChangeCommitted={ () => {
                                updateOverlayMouseVisuals({
                                    custom_cursor_size: Number( mouseSize )
                                });
                            }}
                        />                    

                    </Stack>
                </Container>

                <Typography gutterBottom component="div" margin={0} mb={2} mt={5}>
                    Overlay preview
                </Typography>
                
                <OverlayFrame
                    sx={{
                        ml: '35px',
                        border: `solid ${overlayFrameVisuals?.border_width}px`,
                        borderColor: overlayFrameVisuals?.border_color
                    }}
                >
                    <OcrItemBox
                        sx={{
                            border: `solid ${ocrItemBoxVisuals?.border_width}px`,
                            borderColor: ocrItemBoxVisuals?.border_color,
                            backgroundColor: ocrItemBoxVisuals?.background_color,
                            color: ocrItemBoxVisuals?.text.color,
                            borderRadius: ocrItemBoxVisuals?.border_radius
                        }}
                    >
                        Extracted text
                    </OcrItemBox>

                </OverlayFrame>
            
            </Container>            

        </Box>
    )
}