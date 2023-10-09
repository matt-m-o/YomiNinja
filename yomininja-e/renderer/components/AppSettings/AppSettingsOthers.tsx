import { Box, Container, Divider, FormControlLabel, FormGroup, Switch, SxProps, TextField, Theme, Typography, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { OverlayBehavior } from "../../../electron-src/@core/domain/settings_preset/settings_preset";


// Settings section component
export default function AppSettingsOthers() {

    const { activeSettingsPreset, updateActivePresetBehavior } = useContext( SettingsContext );    

    const overlayBehavior: OverlayBehavior = activeSettingsPreset?.overlay?.behavior;    
    

    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                Overlay Behavior
            </Typography>
            
            <Container sx={{ mt: 2, mb: 2 }}>

                <FormGroup>
                    <FormControlLabel label='Always on top'
                        control={
                            <Switch
                                checked={ Boolean( overlayBehavior?.always_on_top ) }
                                onChange={ ( event ) => {
                                    updateActivePresetBehavior({
                                        always_on_top: event.target.checked
                                    });
                                }}
                            /> 
                        }
                    />
                    <FormControlLabel label='Auto-copy text on hover'
                        control={
                            <Switch
                                checked={ Boolean( overlayBehavior?.copy_text_on_hover ) }
                                onChange={ ( event ) => {
                                    updateActivePresetBehavior({
                                        copy_text_on_hover: event.target.checked
                                    });
                                }}
                            /> 
                        }
                    />
                    <FormControlLabel label='Show Yomichan window on text copy'
                        control={
                            <Switch
                                checked={ Boolean( overlayBehavior?.show_yomichan_window_on_copy ) }
                                onChange={ ( event ) => {
                                    updateActivePresetBehavior({
                                        show_yomichan_window_on_copy: event.target.checked
                                    });
                                }}
                            /> 
                        }
                    />
                </FormGroup>
            
            </Container>
                
        </Box>
    )
}