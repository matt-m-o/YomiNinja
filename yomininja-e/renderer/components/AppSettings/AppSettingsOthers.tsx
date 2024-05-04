import { Box, Container, Divider, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Select, Switch, SxProps, TextField, Theme, Typography, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { ClickThroughMode, OverlayBehavior } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";


// Settings section component
export default function AppSettingsOthers() {

    const { activeSettingsPreset, updateActivePresetBehavior } = useContext( SettingsContext );    

    const overlayBehavior: OverlayBehavior = activeSettingsPreset?.overlay?.behavior;
    const [ clickThroughMode, setClickThroughMode ] = useState<ClickThroughMode>('auto');

    useEffect( () => {

        if ( !overlayBehavior?.click_through_mode )
            return;

        setClickThroughMode( overlayBehavior.click_through_mode );

    }, [ overlayBehavior ] )
    
    const switchFormControlLabelSx: SxProps<Theme> = {
        mt: 0.1,
        mb: 0.1,
    }

    return (
        <Box sx={{ flexGrow: 1, margin: 1, mt: 0 }}>

            <Typography gutterBottom variant="h6" component="div" ml={0} mb={3}>
                Overlay Behavior
            </Typography>
            
            <Container sx={{ mt: 2, mb: 2 }}>

                <FormGroup>

                    <FormControlLabel label='Click-through mode' labelPlacement="top"
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            ml: 0,
                            mb: 0
                        }}
                        control={
                            <Select size="small"
                                value={ clickThroughMode || 'auto' } 
                                onChange={ ( event ) => {
                                    const { value } = event.target
                                    if (typeof value === 'string') {
                                        setClickThroughMode( value as ClickThroughMode );
                                        updateActivePresetBehavior({
                                            click_through_mode: value as ClickThroughMode
                                        })
                                    }
                                }}
                                sx={{ width: '145px' }}
                            >
                                <MenuItem value='auto'>Auto</MenuItem>
                                <MenuItem value='enabled'>Enabled</MenuItem>
                                <MenuItem value='disabled'>Disabled</MenuItem>
                            </Select>
                        }
                    />

                    
                    <FormControlLabel label='React to clicks with click-through enabled'
                        sx={{
                            ...switchFormControlLabelSx,
                            mb: 1
                        }}
                        control={
                            <Switch
                                checked={ Boolean( overlayBehavior?.always_forward_mouse_clicks ) }
                                onChange={ ( event ) => {
                                    updateActivePresetBehavior({
                                        always_forward_mouse_clicks: event.target.checked
                                    });
                                }}
                            /> 
                        }
                    />

                    <FormControlLabel label='Always on top' title="Not available when click-through is disabled"
                        sx={ switchFormControlLabelSx }
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

                    <FormControlLabel label='Show overlay without stealing focus'
                        sx={{
                            ...switchFormControlLabelSx,
                        }}
                        control={
                            <Switch
                                checked={ Boolean( overlayBehavior?.show_window_without_focus ) }
                                onChange={ ( event ) => {
                                    updateActivePresetBehavior({
                                        show_window_without_focus: event.target.checked
                                    });
                                }}
                            /> 
                        }
                    />

                    <FormControlLabel label='Hide boxes on focus loss'
                        sx={{
                            ...switchFormControlLabelSx,
                        }}
                        control={
                            <Switch
                                checked={ Boolean( overlayBehavior?.hide_results_on_blur ) }
                                onChange={ ( event ) => {
                                    updateActivePresetBehavior({
                                        hide_results_on_blur: event.target.checked
                                    });
                                }}
                            /> 
                        }
                    />

                    <FormControlLabel label='Copy text on click'
                        sx={ switchFormControlLabelSx }
                        control={
                            <Switch
                                checked={ Boolean( overlayBehavior?.copy_text_on_click ) }
                                onChange={ ( event ) => {
                                    updateActivePresetBehavior({
                                        copy_text_on_click: event.target.checked
                                    });
                                }}
                            /> 
                        }
                    />
                    <FormControlLabel label='Copy text on hover'
                        sx={ switchFormControlLabelSx }
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

                    <FormControlLabel label='Show window on text copy (e.g. Yomichan Search)'
                        title='Use this feature to show popup dictionaries like Yomichan or Yomitan'
                        sx={{
                            ...switchFormControlLabelSx,
                            mt: 1,
                            mb: 0
                        }}
                        control={
                            <Switch
                                checked={ Boolean( overlayBehavior?.show_window_on_copy?.enabled ) }
                                onChange={ ( event ) => {
                                    updateActivePresetBehavior({
                                        show_window_on_copy: {
                                            ...overlayBehavior?.show_window_on_copy,
                                            enabled: event.target.checked
                                        }
                                    });
                                }}
                            /> 
                        }
                    />

                    <TextField type="text"
                        label="Window title"
                        size="small"
                        value={ overlayBehavior?.show_window_on_copy?.title }
                        onChange={ (event: ChangeEvent< HTMLInputElement >) => {
                            updateActivePresetBehavior({
                                show_window_on_copy: {
                                    ...overlayBehavior?.show_window_on_copy,
                                    title: event.target.value
                                }
                            });
                        }}
                        sx={{
                            width: '100%',
                            maxWidth: '450px',
                            mt: 1,
                            mb: 2,
                        }}
                    />

                </FormGroup>
            
            </Container>
                
        </Box>
    )
}