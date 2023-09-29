import { Box, Container, Divider, FormControlLabel, FormGroup, Switch, SxProps, TextField, Theme, Typography, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { OverlayFrameVisuals, OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset";


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

    const [ ocrItemBoxVisuals, setOcrItemBoxVisuals ] = useState<OverlayOcrItemBoxVisuals>();
    const [ overlayFrameVisuals, setOverlayFrame ] = useState<OverlayFrameVisuals>();

    useEffect( () => {

        if ( !activeSettingsPreset )
            return;

        const { ocr_item_box, frame } = activeSettingsPreset?.overlay?.visuals;

        if ( ocr_item_box ) {

            setOcrItemBoxVisuals( ocr_item_box );
            setOverlayFrame( frame );
        }

    }, [ activeSettingsPreset ] );


    function updateOcrItemBoxVisuals( update: Partial<OverlayOcrItemBoxVisuals> ) {    
        
        // console.log(update);
        
        updateActivePresetVisuals({
            ocr_item_box: {
                ...activeSettingsPreset.overlay.visuals.ocr_item_box,
                ...update
            }
        });
    }

    function updateOverlayFrameVisuals( update: Partial<OverlayFrameVisuals> ) {

        // console.log(update);
        
        updateActivePresetVisuals({
            frame: {
                ...activeSettingsPreset.overlay.visuals.frame,
                ...update
            }
        });
    }
    
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

                <Typography gutterBottom component="div" mb={1}>
                    OCR Text Boxes
                </Typography>

                <Container sx={{ mt: 2, mb: 2 }}>

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
                                    color: event.target.value
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

                

                <Typography gutterBottom component="div" mb={1}>
                    Overlay Frame
                </Typography>

                <Container sx={{ mt: 2, mb: 2 }}>

                    <TextField label="Border color" sx={textFieldBaseSx}                      
                        size='small'
                        type="color"                        
                        inputProps={{ style: { textAlign: 'center' } }}                        
                        value={ overlayFrameVisuals?.border_color || '' }
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



                <Typography gutterBottom component="div" margin={0} mb={1} mt={5}>
                    Overlay preview
                </Typography>
                
                <OverlayFrame
                    sx={{
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
                        OCR Text
                    </OcrItemBox>

                </OverlayFrame>
            
            </Container>            

                

            <Divider/>
        </Box>
    )
}