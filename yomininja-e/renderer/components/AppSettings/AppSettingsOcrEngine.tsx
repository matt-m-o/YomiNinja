import { Box, Container, Divider, FormControlLabel, FormGroup, Popover, Slider, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { OcrEngineSettings, OverlayBehavior } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import Button from '@mui/material/Button';


// Settings section component
export default function AppSettingsOcrEngine() {

    const { activeSettingsPreset, updateActivePresetOcrEngine } = useContext( SettingsContext );    

    const ocrEngineSettings: OcrEngineSettings = activeSettingsPreset?.ocr_engine;
    
    const [ imageScalingFactor, setImageScalingFactor ] = useState( ocrEngineSettings?.image_scaling_factor || 1 );
    const [ maxImageWidth, setMaxImageWidth ] = useState( ocrEngineSettings?.max_image_width || 1920 );
    const [ cpuThreads, setCpuThreads ] = useState( ocrEngineSettings?.cpu_threads || 2 );    

    const deviceCpuThreads = navigator.hardwareConcurrency;

    useEffect( () => {

        if ( !ocrEngineSettings ) return;

        setImageScalingFactor( ocrEngineSettings?.image_scaling_factor );
        setMaxImageWidth( ocrEngineSettings?.max_image_width );
        setCpuThreads( ocrEngineSettings?.cpu_threads );

    }, [ ocrEngineSettings ] )

    const requiresRestartIcon = (
        <Box title='Requires restarting the OCR Engine'>
            <WarningRoundedIcon color="warning" style={{ marginTop: 13, paddingTop: 7 }} />
        </Box>
    );
    

    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                OCR Engine
            </Typography>
            
            <Container sx={{ mt: 2, mb: 4 }}>

                <Typography gutterBottom component="div" margin={2} mb={1} ml={0} fontSize={'1.1rem'}>
                    Image scaling factor
                </Typography>

                <Stack spacing={2} direction="row" sx={{ mb: 1, pl: 2, pr: 0 }} alignItems="center">

                    <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                        Speed
                    </Typography>

                    <Slider
                        marks
                        min={0.1}
                        max={1}
                        step={0.05}
                        valueLabelDisplay="auto"
                        value={ imageScalingFactor }
                        style={{ marginRight: 8 }}
                        onChange={ ( event, newValue ) => {
                            if (typeof newValue === 'number') {
                                setImageScalingFactor( newValue );
                            }
                        }}
                        onChangeCommitted={ () => {
                            console.log({ imageScalingFactor });
                            updateActivePresetOcrEngine({ image_scaling_factor: imageScalingFactor })
                        }}
                    />

                    <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                        Accuracy
                    </Typography>

                </Stack>
            
            </Container>


            <Container sx={{ mt: 2, mb: 2 }}>
                
                <Box display={'flex'} flexDirection={'row'} >
                    <Typography gutterBottom component="div" margin={2} mb={1} ml={0} mr={0.4} fontSize={'1.1rem'}>
                        Maximum image width
                    </Typography>
                    {requiresRestartIcon}
                </Box>

                <Stack spacing={2} direction="row" sx={{ mb: 1, pl: 2, pr: 0 }} alignItems="center">

                    <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                        Speed
                    </Typography>

                    <Slider
                        marks
                        min={960}
                        max={7680}
                        step={320}
                        valueLabelDisplay="auto"
                        value={ maxImageWidth }
                        style={{ marginRight: 8 }}                
                        onChange={ ( event, newValue ) => {                            
                            if (typeof newValue === 'number') {
                                setMaxImageWidth( newValue );
                            }
                        }}
                        onChangeCommitted={ () => {
                            updateActivePresetOcrEngine({ max_image_width: maxImageWidth });
                        }}
                    />

                    <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                        Accuracy
                    </Typography>

                </Stack>
            
            </Container>


            <Container sx={{ mt: 2, mb: 2 }}>
                
                <Box display={'flex'} flexDirection={'row'} >
                    <Typography gutterBottom component="div" margin={2} mb={1} ml={0} mr={0.4} fontSize={'1.1rem'}>
                        CPU threads
                    </Typography>
                    {requiresRestartIcon}
                </Box>            

                <Stack spacing={2} direction="row" sx={{ mb: 1, pl: 2, pr: 2 }} alignItems="center">

                    <Slider
                        marks
                        min={1}
                        max={ deviceCpuThreads }
                        step={1}
                        valueLabelDisplay="auto"
                        value={ cpuThreads }
                        style={{ marginRight: 8 }}                
                        onChange={ ( event, newValue ) => {                            
                            if (typeof newValue === 'number') {
                                setCpuThreads( newValue );
                            }
                        }}
                        onChangeCommitted={ () => {
                            updateActivePresetOcrEngine({ cpu_threads: cpuThreads });
                        }}
                    />                    

                </Stack>
            
            </Container>
            

            <Container sx={{
                display:'flex',
                justifyContent: 'center',
                mt: 2, mb: 2,
                pt: 2
            }}>

                <Button variant="contained"
                    startIcon={<RestartAltRoundedIcon />}
                >
                    Restart OCR Engine
                </Button>

            </Container>

            
                
        </Box>
    )
}