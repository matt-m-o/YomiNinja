import { Alert, Backdrop, Box, Button, Card, CardContent, CircularProgress, Container, Divider, FilledInput, FormControl, FormControlLabel, FormGroup, FormLabel, IconButton, InputAdornment, InputLabel, Link, MenuItem, OutlinedInput, Popover, Radio, RadioGroup, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, ToggleButton, ToggleButtonGroup, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { MangaOcrEngineSettings } from "../../../../electron-src/@core/infra/ocr/manga_ocr.adapter/manga_ocr_settings";
import CommonOcrSettings from "./CommonOcrSettings";
import { ipcRenderer } from "../../../utils/ipc-renderer";
import { HardwareAccelerationOption } from "../../../../electron-src/@core/application/adapters/ocr.adapter";


type MangaOcrSettingsProps = {
    ocrEngineSettings: MangaOcrEngineSettings;
}


export default function MangaOcrSettings( props: MangaOcrSettingsProps ) {

    const { ocrEngineSettings } = props;

    const {
        activeSettingsPreset,
        updateActivePresetOcrEngine,
        getHardwareAccelerationOptions,
        installHardwareAcceleration
    } = useContext( SettingsContext );

    const [ textDetector, setTextDetector ] = useState( ocrEngineSettings?.text_detector || 'ComicTextDetector' );
    const [ HWOptions, setHWOptions ] = useState<HardwareAccelerationOption[]|undefined>([]);
    const [ activeHWOption, setActiveHWOption ] = useState<string|undefined>('');
    const [ selectedHWOption, setSelectedHWOption ] = useState<string|undefined>('');


    const paddleOcrSettings = activeSettingsPreset?.ocr_engines
            .find( engineSettings => {
                return engineSettings.ocr_adapter_name === 'PpOcrAdapter'
            });

    useEffect( () => {

        if ( !ocrEngineSettings ) return;

        setTextDetector( ocrEngineSettings?.text_detector );
        // setCpuThreads( ocrEngineSettings?.cpu_threads );

        refreshHWOptions();

    }, [ ocrEngineSettings ] );

    function handleEngineSettingsUpdate( update: Partial< MangaOcrEngineSettings > ) {
        updateActivePresetOcrEngine({
            ...ocrEngineSettings,
            ...update
        });
    }

    function refreshHWOptions() {
        getHardwareAccelerationOptions( 'MangaOcrAdapter' )
            .then( options => {
                setHWOptions(options);

                const activeOption = options.find( option => option.installed );

                if ( !activeOption )
                    return;

                const activeOptionID = getHWOptionID(activeOption);

                setActiveHWOption( activeOptionID );
                setSelectedHWOption( activeOptionID );
            });
    }

    function getHWOptionID(option): string {
        return [
            option.backend,
            option.computePlatform,
            option.computePlatformVersion || ''
        ].join('/');
    }

    function handleHWSelection(
        event: React.ChangeEvent<HTMLInputElement>,
        optionID: string
    ) {
        setSelectedHWOption( optionID );
    }

    function applyHWSelection() {
        if ( !selectedHWOption ) return;
        const [ backend, computePlatform, computePlatformVersion ] = selectedHWOption.split('/');
        const option = HWOptions.find( option => (
            backend == option.backend &&
            computePlatform == option.computePlatform &&
            computePlatformVersion == option.computePlatformVersion
        ));
        
        if ( !option ) return;
            
        installHardwareAcceleration( 'MangaOcrAdapter', option )
            .then( success => {
                if (success)
                    refreshHWOptions();
            });
    }

    function createLink(input: { link: string, displayText: string }) {
        return (
            <Link href="#"
                title={input.link}
                onClick={ () => ipcRenderer.invoke( 'open_link', input.link )  }
                style={{
                    textDecoration: 'none'
                }}
            >
                {input.displayText}
            </Link>
        )
    }

    const mangaOcrLink = createLink({
        link: 'https://github.com/kha-white/manga-ocr',
        displayText: 'MangaOCR'
    });

    const comicTextDetector = createLink({
        link: 'https://github.com/dmMaze/comic-text-detector',
        displayText: 'Comic Text Detector'
    });


    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>

            <Typography component="div" fontSize='1.0rem'
                mt={1} mb={4}
            >
                {mangaOcrLink} can be used as a general purpose printed Japanese OCR, but its main goal was to provide a high quality text recognition, robust against various scenarios specific to manga.
            </Typography>

            <CommonOcrSettings ocrEngineSettings={ocrEngineSettings} />
            
            <Container
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    marginLeft: '20px',
                    marginTop: '40px'
                }}
            >
            
                <FormControl fullWidth 
                    sx={{
                        display:'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: 300
                    }}>
                    
                    <Select
                        value={ textDetector || '' }
                        label="Text Detector"
                        onChange={ ( event ) => {
                            const { value } = event.target;
                            if (typeof value === 'string') {
                                setTextDetector( value );
                                handleEngineSettingsUpdate({
                                    text_detector: value
                                });
                            }
                        }}
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value='ComicTextDetector'>
                            Comic Text Detector
                        </MenuItem>
                        { paddleOcrSettings &&
                            <MenuItem value='PaddleTextDetector'>
                                Paddle Text Detector
                            </MenuItem>
                        }
                    </Select>

                    <InputLabel>Text Detector</InputLabel>

                </FormControl>

                <FormControl sx={{ mt: 4 }}>
                    <FormLabel id="hw-radio-buttons-group-label">Inference Runtime</FormLabel>
                    <RadioGroup 
                        row
                        aria-labelledby="hw-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={selectedHWOption}
                        onChange={handleHWSelection}
                    >
                        { HWOptions?.map( option => {
                            const value = getHWOptionID(option);
                            const isActive = value === activeHWOption;
                            const shortLabel = option.computePlatform+' '+option.computePlatformVersion;
                            const longLabel = option.backend+' '+option.computePlatform+' '+option.computePlatformVersion;
                            const title = isActive ? longLabel+' (Active)' : longLabel;
                            const outerRingColor = isActive ? '#40a3f3' : 'gray';
                            return (
                                <FormControlLabel
                                    value={value}
                                    title={title}
                                    control={
                                        <Radio
                                            sx={{
                                                color: outerRingColor,
                                                '&.Mui-checked': {
                                                    color: '#40a3f3',
                                                },
                                            }}
                                        />
                                    }
                                    label={shortLabel}
                                    sx={{ml: 2, mr: 3}}
                                />    
                            )
                        })}
                        
                        <Button disabled={activeHWOption == selectedHWOption}
                            variant="contained"
                            sx={{ ml: 3 }}
                            onClick={applyHWSelection}
                        >
                            Apply
                        </Button>
                    </RadioGroup>
                </FormControl>

            </Container>

            <Typography fontSize='1.08rem' lineHeight={2} ml={1} mb={0} mt={'56px'}
                sx={{ fontWeight: 600 }}
            >
                Links:
            </Typography>

            <ul
                style={{
                    fontSize: '1rem',
                    color: 'lightgray',
                    lineHeight: 2,
                    marginTop: 0,
                    marginLeft: 15
                }}
            >
                <li>
                    <strong> {mangaOcrLink} </strong>
                </li>
                <li>
                    <strong> {comicTextDetector} </strong>
                </li>
            </ul>
    
        </Box>
    )
}