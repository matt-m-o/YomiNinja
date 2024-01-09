import { Alert, Backdrop, Box, CircularProgress, Container, Divider, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { OcrEngineSettings, OverlayBehavior } from "../../../../electron-src/@core/domain/settings_preset/settings_preset";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import Button from '@mui/material/Button';
import { OcrEngineSettingsU } from "../../../../electron-src/@core/infra/types/entity_instance.types";
import { ppOcrAdapterName } from "../../../../electron-src/@core/infra/ppocr.adapter/ppocr_settings";
import CommonOcrSettings, { SettingsOptionContainer } from "./CommonOcrSettings";
import OcrSettingsSlider from "./OcrSettingsSlider";




type PpOcrSettingsProps = {
    ocrEngineSettings: OcrEngineSettingsU;    
}

// Settings section component
export default function PpOcrSettings( props: PpOcrSettingsProps ) {

    const { ocrEngineSettings } = props;

    const { updateActivePresetOcrEngine, triggerOcrEngineRestart } = useContext( SettingsContext );    

    
    const [ maxImageWidth, setMaxImageWidth ] = useState( ocrEngineSettings?.max_image_width || 1920 );
    const [ cpuThreads, setCpuThreads ] = useState( ocrEngineSettings?.cpu_threads || 2 );
    const [ inferenceRuntime, setInferenceRuntime ] = useState( ocrEngineSettings?.inference_runtime || '' );
    const [ detDbThresh, setDetDbThresh ] = useState( ocrEngineSettings?.det_db_thresh || 0.3 );
    const [ detDbBoxThresh, setDetDbBoxThresh ] = useState( ocrEngineSettings?.det_db_box_thresh || 0.6 );
    const [ detDbUnclipRatio, setDetDbUnclipRatio ] = useState( ocrEngineSettings?.det_db_unclip_ratio || 1.5 );
    const [ detDbScoreMode, setDetDbScoreMode ] = useState( ocrEngineSettings?.det_db_score_mode || 'slow' );
    const [ useDilation, setUseDilation ] = useState( ocrEngineSettings?.use_dilation || false );

    useEffect( () => {

        if ( !ocrEngineSettings ) return;

        setMaxImageWidth( ocrEngineSettings?.max_image_width );
        setCpuThreads( ocrEngineSettings?.cpu_threads );
        setInferenceRuntime( ocrEngineSettings.inference_runtime );

    }, [ ocrEngineSettings ] )

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

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                PaddleOCR
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
                        updateActivePresetOcrEngine({
                            ...ocrEngineSettings,
                            max_image_width: maxImageWidth
                        });
                    }}
                />
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
                        updateActivePresetOcrEngine({
                            ...ocrEngineSettings,
                            cpu_threads: cpuThreads
                        });
                    }}
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
                                updateActivePresetOcrEngine({
                                    ...ocrEngineSettings,
                                    inference_runtime: value
                                });
                            }
                        }}
                    >
                        <MenuItem value='Open_VINO'>OpenVino CPU (fastest)</MenuItem>
                        <MenuItem value='ONNX_CPU'>ONNX CPU</MenuItem>
                    </Select>
                    <InputLabel>Inference Runtime</InputLabel>{requiresRestartIcon}
                </FormControl>

            </SettingsOptionContainer>
            
            <SettingsOptionContainer>
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
                        updateActivePresetOcrEngine({
                            ...ocrEngineSettings,
                            det_db_thresh: detDbThresh
                        });
                    }}
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
                        updateActivePresetOcrEngine({
                            ...ocrEngineSettings,
                            det_db_box_thresh: detDbBoxThresh
                        });
                    }}
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
                        updateActivePresetOcrEngine({
                            ...ocrEngineSettings,
                            det_db_unclip_ratio: detDbUnclipRatio
                        });
                    }}
                />
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
                                updateActivePresetOcrEngine({
                                    ...ocrEngineSettings,
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

            <SettingsOptionContainer sx={{ display: 'flex', mt: 2, mb: 2 }}>
                <FormControlLabel
                    label='Inflate the segmentation results to obtain better detection results'
                    title="use_dilation"
                    control={
                        <Switch
                            checked={ useDilation }
                            onChange={ ( event ) => {
                                setUseDilation( event.target.checked );
                                updateActivePresetOcrEngine({
                                    ...ocrEngineSettings,
                                    use_dilation: event.target.checked
                                });
                            }}
                        /> 
                    }
                    sx={{ mr: 0.5 }}
                />
                {requiresRestartIcon}
            </SettingsOptionContainer>
            

            <Container 
                sx={{
                    display:'flex',
                    justifyContent: 'center',
                    mt: 2, mb: 2,
                    pt: 2
                }}
            >

                <Button variant="contained"
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