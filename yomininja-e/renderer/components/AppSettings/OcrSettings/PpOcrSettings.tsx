import { Accordion, AccordionDetails, Alert, Backdrop, Box, Card, CardContent, CircularProgress, Container, Divider, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import Button from '@mui/material/Button';
import { OcrEngineSettingsU } from "../../../../electron-src/@core/infra/types/entity_instance.types";
import CommonOcrSettings, { SettingsOptionContainer } from "./CommonOcrSettings";
import OcrSettingsSlider from "./OcrSettingsSlider";
import { PpOcrEngineSettings } from "../../../../electron-src/@core/infra/ocr/ppocr.adapter/ppocr_settings";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AccordionSummary from '@mui/material/AccordionSummary';
import ResetParameterButton from "./common/ResetParameterButton";


const defaultSettings = {
    image_scaling_factor: 1,
    max_image_width: 1600,
    invert_colors: false,
    inference_runtime: 'Open_VINO',
    det_db_thresh: 0.3,
    det_db_box_thresh: 0.6,
    det_db_unclip_ratio: 1.6,
    det_db_score_mode: "slow",
    use_dilation: false,
    cls_thresh: 0.9,
}


type PpOcrSettingsProps = {
    ocrEngineSettings: PpOcrEngineSettings;    
}

// Settings section component
export default function PpOcrSettings( props: PpOcrSettingsProps ) {

    const { ocrEngineSettings } = props;

    const { updateActivePresetOcrEngine, triggerOcrEngineRestart } = useContext( SettingsContext );    

    
    const [ maxImageWidth, setMaxImageWidth ] = useState( ocrEngineSettings?.max_image_width || defaultSettings.max_image_width );
    const [ cpuThreads, setCpuThreads ] = useState( ocrEngineSettings?.cpu_threads || navigator.hardwareConcurrency );
    const [ inferenceRuntime, setInferenceRuntime ] = useState( ocrEngineSettings?.inference_runtime || defaultSettings.inference_runtime );
    const [ detDbThresh, setDetDbThresh ] = useState( ocrEngineSettings?.det_db_thresh || defaultSettings.det_db_thresh );
    const [ detDbBoxThresh, setDetDbBoxThresh ] = useState( ocrEngineSettings?.det_db_box_thresh || defaultSettings.det_db_box_thresh );
    const [ detDbUnclipRatio, setDetDbUnclipRatio ] = useState( ocrEngineSettings?.det_db_unclip_ratio || defaultSettings.det_db_unclip_ratio );
    const [ detDbScoreMode, setDetDbScoreMode ] = useState( ocrEngineSettings?.det_db_score_mode || defaultSettings.det_db_score_mode );
    const [ useDilation, setUseDilation ] = useState( ocrEngineSettings?.use_dilation || defaultSettings.use_dilation );

    useEffect( () => {

        if ( !ocrEngineSettings ) return;

        setMaxImageWidth( ocrEngineSettings?.max_image_width );
        setCpuThreads( ocrEngineSettings?.cpu_threads );
        setInferenceRuntime( ocrEngineSettings.inference_runtime );

    }, [ ocrEngineSettings ] )


    function handleEngineSettingsUpdate( update: Partial< PpOcrEngineSettings > ) {
        updateActivePresetOcrEngine({
            ...ocrEngineSettings,
            ...update
        });
    }

    function resetDetDbUnclipRatio() {
        const { det_db_unclip_ratio } = defaultSettings;
        handleEngineSettingsUpdate({
            det_db_unclip_ratio
        });
        setDetDbUnclipRatio( det_db_unclip_ratio );
    }

    function resetMaxImageWidth() {
        const { max_image_width } = defaultSettings;
        handleEngineSettingsUpdate({
            max_image_width
        });
        setMaxImageWidth( max_image_width );
    }

    function resetCpuThreads() {
        const cpu_threads = navigator.hardwareConcurrency;
        handleEngineSettingsUpdate({
            cpu_threads
        });
        setCpuThreads( cpu_threads );
    }

    function resetDetDbThresh() {
        const { det_db_thresh } = defaultSettings;
        handleEngineSettingsUpdate({
            det_db_thresh
        });
        setDetDbThresh( det_db_thresh );
    }

    function resetDetDbBoxThresh() {
        const { det_db_box_thresh } = defaultSettings;
        handleEngineSettingsUpdate({
            det_db_box_thresh
        });
        setDetDbBoxThresh( det_db_box_thresh );
    }

    const requiresRestartIcon = (
        <Box title='Requires restarting the OCR Engine' 
            display='flex'
            alignItems='center'
        >
            <WarningRoundedIcon color="warning" style={{
                width: '17px',
                height: '17px',
            }}/>
        </Box>
    );



    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography component="div" fontSize='1.0rem'
                mt={1} mb={4}
            >
                Fast and reliable for most use cases. Operates entirely offline.
            </Typography>

            <CommonOcrSettings ocrEngineSettings={ocrEngineSettings} />

            <SettingsOptionContainer>
                <OcrSettingsSlider
                    label="Maximum image width"
                    leftLabel="Speed"
                    rightLabel="Accuracy"
                    icon={requiresRestartIcon}
                    marks
                    min={960} max={7680} step={320}
                    value={ maxImageWidth }
                    onChange={ ( event, newValue ) => {                            
                        if (typeof newValue === 'number') {
                            setMaxImageWidth( newValue );
                        }
                    }}
                    onChangeCommitted={ () => {
                        handleEngineSettingsUpdate({
                            max_image_width: maxImageWidth
                        });
                    }}
                    reset={ resetMaxImageWidth }
                />
            </SettingsOptionContainer>

            <SettingsOptionContainer>
                <OcrSettingsSlider
                    label="Text area expansion factor"
                    title='det_db_unclip_ratio'
                    icon={requiresRestartIcon}
                    min={0.01} max={ 10 } step={0.01}
                    value={ detDbUnclipRatio }
                    onChange={ ( event, newValue ) => {
                        if (typeof newValue === 'number') {
                            setDetDbUnclipRatio( newValue );
                        }
                    }}
                    onChangeCommitted={ () => {
                        handleEngineSettingsUpdate({
                            det_db_unclip_ratio: detDbUnclipRatio
                        });
                    }}
                    reset={ resetDetDbUnclipRatio }
                />
            </SettingsOptionContainer>

            <SettingsOptionContainer sx={{ display: 'flex', mt: 2, mb: 2 }}>
                <FormControlLabel
                    label='Inflate the segmentation results to obtain better detection results'
                    title="use_dilation"
                    control={
                        <Switch
                            checked={ useDilation }
                            onChange={ ( event ) => {
                                setUseDilation( event.target.checked );
                                handleEngineSettingsUpdate({
                                    use_dilation: event.target.checked
                                });
                            }}
                        /> 
                    }
                    sx={{ mr: 0.5 }}
                />
                {requiresRestartIcon}
            </SettingsOptionContainer>

            <SettingsOptionContainer sx={{ mt: 4 }}>
                <FormControl fullWidth 
                    sx={{
                        display:'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: 300
                    }}>
                    
                    <Select
                        value={ detDbScoreMode || '' }
                        label="Detection score mode"
                        title="det_db_score_mode"
                        onChange={ ( event ) => {
                            const value = event.target.value as 'slow' | 'fast';
                            if (typeof value === 'string') {
                                setDetDbScoreMode( value );
                                handleEngineSettingsUpdate({
                                    det_db_score_mode: value
                                });
                            }
                        }}
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value='slow'>Slow</MenuItem>
                        <MenuItem value='fast'>Fast</MenuItem>
                    </Select>

                    <InputLabel>Detection score mode</InputLabel>{requiresRestartIcon}

                </FormControl>
            </SettingsOptionContainer>


            <SettingsOptionContainer>
                <OcrSettingsSlider
                    label="CPU threads"
                    icon={requiresRestartIcon}
                    marks
                    min={1} step={1}
                    max={ navigator.hardwareConcurrency }
                    value={ cpuThreads }
                    onChange={ ( event, newValue ) => {
                        if (typeof newValue === 'number') {
                            setCpuThreads( newValue );
                        }
                    }}
                    onChangeCommitted={ () => {
                        handleEngineSettingsUpdate({
                            cpu_threads: cpuThreads
                        });
                    }}
                    reset={ resetCpuThreads }
                />
            </SettingsOptionContainer>

            <SettingsOptionContainer sx={{ mt: 4 }}>

                <FormControl fullWidth sx={{ display:'flex', flexDirection: 'row', width: 300 }}>
                    
                    <Select                
                        value={ inferenceRuntime || '' }
                        label="Inference Runtime"                        
                        onChange={ ( event ) => {
                            const { value } = event.target
                            if (typeof value === 'string') {
                                setInferenceRuntime( value );
                                console.log(value)
                                handleEngineSettingsUpdate({
                                    inference_runtime: value
                                });
                            }
                        }}
                    >
                        <MenuItem value='Open_VINO'
                            title="Can crash on some AMD CPUs (Windows)"
                        >
                            OpenVINO CPU (fastest)
                        </MenuItem>
                        <MenuItem value='ONNX_CPU'>ONNX CPU</MenuItem>
                    </Select>
                    <InputLabel>Inference Runtime</InputLabel>{requiresRestartIcon}
                </FormControl>

            </SettingsOptionContainer>
            
            <Container>
                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                        <Typography fontSize={'1.1rem'}>
                            Subtle adjustments
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>

                        <SettingsOptionContainer sx={{mt:0}}>
                            <OcrSettingsSlider
                                label="Text pixel detection threshold"
                                title='det_db_thresh'
                                icon={requiresRestartIcon}
                                marks
                                min={0.01} max={ 1 } step={0.01}
                                value={ detDbThresh }
                                onChange={ ( event, newValue ) => {
                                    if (typeof newValue === 'number') {
                                        setDetDbThresh( newValue );
                                    }
                                }}
                                onChangeCommitted={ () => {
                                    handleEngineSettingsUpdate({
                                        det_db_thresh: detDbThresh
                                    });
                                }}
                                reset={ resetDetDbThresh }
                            />
                        </SettingsOptionContainer>
                

                        <SettingsOptionContainer>
                            <OcrSettingsSlider
                                label="Text area detection threshold"
                                title='det_db_box_thresh'
                                icon={requiresRestartIcon}
                                marks
                                min={0.01} max={ 1 } step={0.01}
                                value={ detDbBoxThresh }
                                onChange={ ( event, newValue ) => {
                                    if (typeof newValue === 'number') {
                                        setDetDbBoxThresh( newValue );
                                    }
                                }}
                                onChangeCommitted={ () => {
                                    handleEngineSettingsUpdate({
                                        det_db_box_thresh: detDbBoxThresh
                                    });
                                }}
                                reset={ resetDetDbBoxThresh }
                            />
                        </SettingsOptionContainer>

                    </AccordionDetails>
                </Accordion>
            </Container>
            

            <Container 
                sx={{
                    display:'flex',
                    justifyContent: 'center',
                    mt: 2, mb: 2,
                    pt: 2
                }}
            >

                <Button variant="contained" fullWidth
                    startIcon={<RestartAltRoundedIcon />}
                    onClick={ () => {
                        triggerOcrEngineRestart( ocrEngineSettings.ocr_adapter_name );
                    }}
                >
                    Restart OCR Engine
                </Button>

            </Container>
                
        </Box>
    )
}