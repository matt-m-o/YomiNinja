import { Alert, Backdrop, Box, CircularProgress, Container, Divider, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
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
    const [ invertColors, setInvertColors ] = useState( ocrEngineSettings?.invert_colors || false );
    const [ maxImageWidth, setMaxImageWidth ] = useState( ocrEngineSettings?.max_image_width || 1920 );
    const [ cpuThreads, setCpuThreads ] = useState( ocrEngineSettings?.cpu_threads || 2 );
    const [ inferenceRuntime, setInferenceRuntime ] = useState( ocrEngineSettings?.inference_runtime || '' );

    useEffect( () => {

        if ( !ocrEngineSettings ) return;

        setImageScalingFactor( ocrEngineSettings?.image_scaling_factor );
        setMaxImageWidth( ocrEngineSettings?.max_image_width );
        setCpuThreads( ocrEngineSettings?.cpu_threads );
        setInferenceRuntime( ocrEngineSettings.inference_runtime );

    }, [ ocrEngineSettings ] )

    const requiresRestartIcon = (
        <Box title='Requires restarting the OCR Engine'>
            <WarningRoundedIcon color="warning" style={{ marginTop: 13, paddingTop: 7 }} />
        </Box>
    );
    
    function triggerOcrEngineRestart() {
        global.ipcRenderer.invoke( 'ocr_recognition:restart_engine' );
        setOpenBackdrop( true );
    }

    useEffect( () => {

        global.ipcRenderer.on( 'ocr_recognition:ocr_engine_restarted', ( ) => {
            setOpenBackdrop( false );
            setOpenSnackbar( true );
        });
        
        return () => {
            global.ipcRenderer.removeAllListeners( 'ocr_recognition:ocr_engine_restarted' );            
        }
    }, [ global.ipcRenderer ] );
    
    
    const [ openBackdrop, setOpenBackdrop ] = useState(false);
    const backdrop = (
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={openBackdrop}            
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    )
    
    const [ openSnackbar, setOpenSnackbar ] = useState(false);
    const snackbar = (
        <Snackbar open={openSnackbar} autoHideDuration={6000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            onClose={ () => setOpenSnackbar(false) }
            sx={{ minWidth: '300px' }}
        >
            <Alert severity="info" sx={{ width: '100%' }}
                onClose={ () => setOpenSnackbar(false) }
            >
                OCR Engine restarted!
            </Alert>
        </Snackbar>
    )


    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            {backdrop}
            {snackbar}

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                OCR Engine
            </Typography>
            
            <Container sx={{ mt: 2, mb: 4 }}>

                <FormControlLabel label='Invert image colors'
                    control={
                        <Switch
                            checked={ Boolean( invertColors ) }
                            onChange={ ( event ) => {
                                setInvertColors( event.target.checked );
                                updateActivePresetOcrEngine({ invert_colors: event.target.checked });
                            }}
                        /> 
                    }
                />

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
                            updateActivePresetOcrEngine({ image_scaling_factor: imageScalingFactor });
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
                        max={ navigator.hardwareConcurrency }
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

                <FormControl fullWidth sx={{ width: 300, mt: 2 }}>
                    <InputLabel>Inference Runtime</InputLabel>
                    <Select                
                        value={ inferenceRuntime || '' }
                        label="Inference Runtime"                        
                        onChange={ ( event ) => {
                            const { value } = event.target
                            if (typeof value === 'string') {
                                setInferenceRuntime( value );
                                console.log(value)
                                updateActivePresetOcrEngine({ inference_runtime: value });
                            }
                        }}                        
                    >
                        <MenuItem value='Open_VINO'>OpenVino CPU (fastest)</MenuItem>
                        <MenuItem value='ONNX_CPU'>ONNX CPU</MenuItem>
                    </Select>
                    
                </FormControl>
            
            </Container>
            

            <Container sx={{
                display:'flex',
                justifyContent: 'center',
                mt: 2, mb: 2,
                pt: 2
            }}>

                <Button variant="contained"
                    startIcon={<RestartAltRoundedIcon />}
                    onClick={triggerOcrEngineRestart}
                >
                    Restart OCR Engine
                </Button>

            </Container>

            
                
        </Box>
    )
}