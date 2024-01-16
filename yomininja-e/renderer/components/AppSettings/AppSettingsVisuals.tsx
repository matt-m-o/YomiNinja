import { Box, Container, Divider, FormControlLabel, FormGroup, Slider, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { CSSProperties, useCallback, useContext, useEffect, useState } from "react";
import { OverlayFrameVisuals, OverlayMouseVisuals, OverlayOcrItemBoxVisuals, OverlayVisualCustomizations } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { throttle } from "lodash";
import CustomCursor from "../OcrOverlay/CustomCursor/CustomCursor";
import { ProfileContext } from "../../context/profile.provider";
import ColorPicker from "../common/ColorPicker";
import OcrResultBoxVisualSettings from "./VisualSettings/OcrResultBoxVisuals";


const OverlayFrame = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '400px',
    height: '225px',
    padding: '10px',
});

const BaseOcrResultBox = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content',
    height: '40px',
    padding: '10px',
    color: 'transparent',
});

// Settings section component
export default function AppSettingsVisuals() {

    const { activeSettingsPreset, updateActivePresetVisuals } = useContext( SettingsContext );
    const { profile } = useContext( ProfileContext );


    const ocrItemBoxVisuals: OverlayOcrItemBoxVisuals = activeSettingsPreset?.overlay?.visuals.ocr_item_box;
    const overlayFrameVisuals: OverlayFrameVisuals = activeSettingsPreset?.overlay?.visuals.frame;
    const overlayMouseVisuals: OverlayMouseVisuals = activeSettingsPreset?.overlay?.visuals.mouse;

    const [ mouseSize, setMouseSize ] = useState<number>( overlayMouseVisuals?.custom_cursor_size || 30 );

    useEffect( () => {

        if ( !overlayMouseVisuals ) return;

        console.log( overlayMouseVisuals )

        setMouseSize( overlayMouseVisuals.custom_cursor_size );

    }, [ overlayMouseVisuals ] )

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
    
        

    const overlayPreviewText = {
        en: 'Extracted text',
        ja: '抽出されたテキスト',
        ch: '提取的文本',
        ko: '추출된 텍스트',
    }[ profile?.active_ocr_language.two_letter_code ];

    const OcrItemBox = styled( BaseOcrResultBox )({
        outline: `solid ${ocrItemBoxVisuals?.border_width}px`,
        outlineColor: ocrItemBoxVisuals?.border_color,
        borderRadius: ocrItemBoxVisuals?.border_radius,
        backgroundColor: ocrItemBoxVisuals?.background_color_inactive,
        "&:hover": {
            contentVisibility: 'visible',
            backgroundColor: ocrItemBoxVisuals?.background_color,
            color: ocrItemBoxVisuals?.text.color,
            letterSpacing: ocrItemBoxVisuals?.text?.letter_spacing || 'inherit',
            fontSize: ocrItemBoxVisuals?.text?.font_size_factor + '%',
            fontWeight: ocrItemBoxVisuals?.text?.font_weight,
            '-webkit-text-stroke-width': ocrItemBoxVisuals?.text?.outline_width,
            '-webkit-text-stroke-color': ocrItemBoxVisuals?.text?.outline_color,
        }
    });

    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                Overlay Appearance
            </Typography>
            
            <Container sx={{ mt: 2, mb: 2 }}>

                
                
                <OcrResultBoxVisualSettings textFieldSx={ textFieldBaseSx } />

                <Typography gutterBottom component="div" mb={1} fontSize='1.1rem'>
                    Overlay frame
                </Typography>

                <Container sx={{ mt: 0, mb: 2 }}>

                    <ColorPicker label="Border Color" sx={textFieldBaseSx}
                        value={ overlayFrameVisuals?.border_color || '' }
                        onChangeComplete={ ( color: string ) => {
                            updateOverlayFrameVisuals({                                
                                border_color: color
                            });
                        }}
                    />

                    <TextField label="Border Width" sx={textFieldBaseSx}                      
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
                            Cursor size
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

                <Typography gutterBottom component="div" margin={0} mb={2} mt={5} fontSize='1.1rem'>
                    Overlay preview
                </Typography>
                
                <OverlayFrame
                    sx={{
                        display: 'flex',
                        ml: '35px',
                        border: `solid ${overlayFrameVisuals?.border_width}px`,
                        borderColor: overlayFrameVisuals?.border_color
                    }}
                >

                    <OcrItemBox>
                        {overlayPreviewText}
                    </OcrItemBox>

                </OverlayFrame>
            
            </Container>            

        </Box>
    )
}