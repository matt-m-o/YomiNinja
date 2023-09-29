import { Box, Container, Divider, FormControlLabel, FormGroup, Switch, SxProps, TextField, Theme, Typography, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { OverlayBehavior } from "../../../electron-src/@core/domain/settings_preset/settings_preset";


// Settings section component
export default function AppSettingsOthers() {

    const { activeSettingsPreset, updateActivePresetBehavior } = useContext( SettingsContext );   

    const [ overlayBehavior, setOverlayBehavior ] = useState< OverlayBehavior >();

    useEffect( () => {

        if ( !activeSettingsPreset )
            return;

        const { behavior } = activeSettingsPreset?.overlay;

        if ( behavior ) {

            setOverlayBehavior( behavior );
        }

    }, [ activeSettingsPreset ] );

    function updateOverlayBehavior( update: Partial<OverlayBehavior> ) {    
        
        // console.log(update);
        
        updateActivePresetBehavior({        
            ...activeSettingsPreset.overlay.behavior,
            ...update,            
        });
    }    
    

    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                Other overlay options
            </Typography>
            
            <Container sx={{ mt: 2, mb: 2 }}>

                <FormGroup>
                    <FormControlLabel label='Copy text on pointer hover'
                        control={
                            <Switch
                                checked={ overlayBehavior?.copy_text_on_hover || false }
                                onChange={ ( event ) => updateOverlayBehavior( {
                                    copy_text_on_hover: event.target.checked
                                })}
                            /> 
                        }
                    />                                    
                </FormGroup>
            
            </Container>
                
        </Box>
    )
}