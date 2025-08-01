import { Box, Container, Divider, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Select, Switch, Typography } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { SettingsPresetJson } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import { GeneralSettings, RunAtSystemStartupOptions } from "../../../electron-src/@core/domain/settings_preset/settings_preset_general";
import { CompatibilitySettings } from "../../../electron-src/@core/domain/settings_preset/settings_preset_compatibility";


// Settings section component
export default function AppSettingsGeneral() {

    const {
        activeSettingsPreset,
        defaultSettingsPreset,
        updateActivePresetGeneral,
        updateActivePresetCompatibility
    } = useContext( SettingsContext );

    const generalSettings: GeneralSettings = activeSettingsPreset?.general;
    const compatibilitySettings: CompatibilitySettings = activeSettingsPreset?.compatibility;

    console.log({
        generalSettings,
        compatibilitySettings
    });
    
    return (
        <Box sx={{ flexGrow: 1, margin: 1, mt:0 }}>

            <Typography gutterBottom variant="h6" component="div" ml={0} mb={3}>
                General
            </Typography>

            <Container sx={{ ml: 1.5,  mt: 2, mb: 2 }}>
                <FormControl fullWidth 
                    sx={{
                        display:'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: 300
                    }}>
                    
                    <Select
                        value={ generalSettings?.run_at_system_startup || 'no' }
                        label="Run at System Startup"
                        title=""
                        onChange={ ( event ) => {
                            const { value } = event.target;
                            if (typeof value === 'string') {
                                console.log(value)
                                updateActivePresetGeneral({
                                    run_at_system_startup: value as RunAtSystemStartupOptions
                                });
                            }
                        }}
                        sx={{ minWidth: !generalSettings?.run_at_system_startup ? 220 : 150 }}
                    >
                        <MenuItem value='minimized'>
                            Minimized
                        </MenuItem>
                        <MenuItem value='yes'>
                            Yes
                        </MenuItem>
                        <MenuItem value='no'>
                            No
                        </MenuItem>
                    </Select>

                    <InputLabel>Run at System Startup</InputLabel>

                </FormControl>
                
            </Container>

            <Container sx={{ ml: 1.5,  mt: 0, mb: 2 }}>
                <FormControlLabel label='Enable Hardware Acceleration'
                    title='Changes will take effect after restarting the app.'
                    control={
                        <Switch
                            checked={
                                typeof compatibilitySettings?.hardware_acceleration === 'undefined' ?
                                    true :
                                    Boolean( compatibilitySettings?.hardware_acceleration )
                            }
                            onChange={ ( event ) => {
                                updateActivePresetCompatibility({
                                    hardware_acceleration: event.target.checked
                                });
                            }}
                        /> 
                    }
                />
            </Container>


            <Container sx={{ ml: 1.5,  mt: 0, mb: 2 }}>
                <FormControlLabel label='Enable GPU Compositing'
                    title='Changes will take effect after restarting the app.'
                    control={
                        <Switch
                            checked={
                                typeof compatibilitySettings?.gpu_compositing === 'undefined' ?
                                    true :
                                    Boolean( compatibilitySettings?.gpu_compositing )
                            }
                            onChange={ ( event ) => {
                                updateActivePresetCompatibility({
                                    gpu_compositing: event.target.checked
                                });
                            }}
                        /> 
                    }
                />
            </Container>

        </Box>
    )
}