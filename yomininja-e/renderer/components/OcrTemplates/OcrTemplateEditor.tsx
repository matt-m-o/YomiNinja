import { Autocomplete, Container, FormControlLabel, MenuItem, Select, styled, Switch, TextField, Typography } from "@mui/material";
import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import OcrTargetRegion from "./OcrTargetRegion";
import Moveable from "react-moveable";
import { OcrTargetRegionJson } from "../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import Selecto from "react-selecto";
import OcrSettingsSlider from "../AppSettings/OcrSettings/OcrSettingsSlider";
import { CustomAccordion } from "../common/CustomAccordion";
import { TTSContext } from "../../context/text-to-speech.provider";
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { CaptureSourceContext } from "../../context/capture_source.provider";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

export type Size = { // Pixels
    width: number;
    height: number;
};

export type Position = { // Pixels
    top: number;
    left: number;
};

export const TemplateDiv = styled('div')( {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    margin: 'auto',
    cursor: 'crosshair',
    '& .moveable-line': {
        backgroundColor: 'red !important'
    },
    '& .moveable-control': {
        backgroundColor: 'red !important'
    }
});

function OptionsAccordion () {
    return 
}

export type OcrTemplateEditorProps = {
    ignoreKeyboard?: boolean;
}

export default function OcrTemplateEditor( props: OcrTemplateEditorProps ) {

    const { ignoreKeyboard } = props;

    const {
        activeOcrTemplate,
        addTargetRegion,
        removeTargetRegion,
        updateTargetRegion,
        updateOcrTemplate
    } = useContext( OcrTemplatesContext );
    const { getVoices } = useContext( TTSContext );

    const { activeCaptureSource } = useContext( CaptureSourceContext );
    const [ templateSize, setTemplateSize ] = useState< Size >();
    const [ selectedTargetRegion, setSelectedTargetRegion ] = useState< OcrTargetRegionJson | null >();

    const motionSensitivity = selectedTargetRegion?.auto_ocr_options?.motion_sensitivity || 0;
    const frameSampleSize = selectedTargetRegion?.auto_ocr_options?.frame_sample_size || 0;
    const intervalBetweenFrames = activeOcrTemplate?.capturer_options?.interval_between_frames || 0;

    const [ maximumFrameRate, setMaximumFrameRate ] = useState(
        intervalBetweenFrames ? Math.floor( 1000 / intervalBetweenFrames ) : 3
    );

    useEffect( () => {
        console.log({
            intervalBetweenFrames,
            maximumFrameRate 
        })
    }, [maximumFrameRate] )
    
    const targetRegionTTSVoiceName: string = getVoices().find(
        voice => {
            return selectedTargetRegion?.text_to_speech_options?.voice_uri == voice.voiceURI
        }
    )?.name || '';
    const ttsVoiceOptions: string[] = getVoices()?.map( voice => voice.name );


    const imgRef = useRef< HTMLImageElement >( null );
    const moveableRef = useRef< Moveable >( null );

    function getTemplateRect(): DOMRect {
        return imgRef.current.getClientRects()[0];
    }

    function handleWindowResize() {

        if ( !imgRef?.current )
            return;

        const rect = getTemplateRect();

        setTemplateSize({
            width: rect.width,
            height: rect.height,
        });
    }

    useEffect(() => {
        window.onresize = handleWindowResize;
    }, []);

    useEffect( () => {

        const handleKeyDown = ( e: KeyboardEvent ) => {

            // console.log({ ignoreKeyboard });

            if ( 
                !selectedTargetRegion?.id ||
                e.key !== 'Delete' ||
                ignoreKeyboard
            ) return;
            
            removeTargetRegion( selectedTargetRegion.id );
            setSelectedTargetRegion( null );
        }

        document.addEventListener( 'keydown', handleKeyDown );

        return () => {
            document.removeEventListener( 'keydown', handleKeyDown );
        };
    }, [ selectedTargetRegion, ignoreKeyboard ] );


    const accordionStyle: CSSProperties = {
        backgroundColor: '#202124',
    };

    return ( <>
        { activeOcrTemplate && <>
        
            <TemplateDiv id='ocr-template-div' className='ocr-template-div'>
                    

                { templateSize &&
                    activeOcrTemplate?.target_regions.map( ( region, idx ) => {
                        return <OcrTargetRegion
                            ocrTemplateElementId="ocr-template-div"
                            moveableRef={moveableRef}
                            key={idx}
                            region={region}
                            templateSize={templateSize}
                            onChange={ updateTargetRegion }
                            isSelected={ selectedTargetRegion?.id === region.id }
                        />
                    }) 
                }
                

                <img src={ 'data:image/png;base64,' + activeOcrTemplate?.image_base64 }
                    ref={imgRef}
                    alt="template background image"
                    draggable={false}
                    onLoad={handleWindowResize}
                    style={{
                        top: 0,
                        left: 0,
                        maxWidth: '100%',
                        maxHeight: '75vh',
                        userSelect: 'none',
                        objectFit: 'cover', 
                        border: 'solid 1px #90caf9',
                        cursor: 'crosshair'
                    }}
                />

                <Selecto
                    selectableTargets={[".ocr-template-div .ocr-region"]}
                    selectByClick={true}
                    selectFromInside={false}
                    continueSelect={false}
                    toggleContinueSelect={"shift"}
                    keyContainer={window}
                    hitRate={100}
                    boundContainer={ document.getElementById( 'ocr-template-div' ) }
                    onSelectEnd={ e => {

                        console.log( e );

                        let didSelectARegion = false;

                        activeOcrTemplate.target_regions?.find( item => {

                            const element = e.selected.find( element => element.id === item.id );
                            if ( !element ) return;

                            setSelectedTargetRegion( item );

                            didSelectARegion = true;
                            
                            return true;
                        });

                        if ( !didSelectARegion )
                            setSelectedTargetRegion( null );
                        else 
                            return;

                        const selectionRect = e.rect;
                        const templateRect = getTemplateRect();
                        
                        const width = selectionRect.width / templateRect.width;
                        const height = selectionRect.height / templateRect.height;

                        const top = ( selectionRect.top - templateRect.top ) / templateRect.height;
                        const left = ( selectionRect.left - templateRect.left ) / templateRect.width;

                        if ( width < 0.025 || height < 0.025 )
                            return;
                        
                        addTargetRegion({
                            ocr_template_id: activeOcrTemplate.id,
                            position: {
                                top,
                                left,
                            },
                            size: {
                                width,
                                height,
                            },
                            angle: 0,
                        });
                    }}
                />
                
            </TemplateDiv>

            {/* <Typography gutterBottom component="div" mt={3} mb={1} fontSize='1.1rem'>
                Region Options
            </Typography> */}

            <Container maxWidth='xl'
                sx={{ mt: 3 }}
                style={{
                    paddingLeft: '0px',
                    paddingRight: '0px',
                }}
            >
                <CustomAccordion style={accordionStyle} disabled={ !Boolean(selectedTargetRegion) }
                    summary={
                        <Typography fontSize={'1.1rem'}>
                            Auto OCR
                        </Typography>
                    }
                    title='Monitors your screen and automatically runs OCR whenever it detects meaningful changes.'
                    detailsSx={{ pl: 3, pr: 3 }}
                >
                    <Typography mb={1}>
                        <strong>Note:</strong> This feature is experimental and will only become active when a <strong>Capture Source</strong> is manually selected.
                        To avoid potential issues, it’s currently recommended to enable this feature for a <strong>single region at a time</strong>.
                    </Typography>

                    { (activeCaptureSource?.type !== 'window') &&
                        <Typography mb={1}>
                            <WarningRoundedIcon color="warning" style={{
                                marginBottom: '-2px',
                                marginRight: '4px', 
                                width: '17px',
                                height: '17px',
                            }}/>
                            The selected capture source is not a window! Please select a window as the capture source!
                        </Typography>
                    }

                    <FormControlLabel label='Enable Auto OCR'
                        sx={{ ml: 0,  mt: 0, mb: 1, width: '100%' }}
                        control={
                            <Switch
                                checked={ Boolean( selectedTargetRegion?.auto_ocr_options?.enabled ) }
                                onChange={ ( event ) => {
                                    console.log( event.target.checked )

                                    const updatedRegion = {
                                        ...selectedTargetRegion,
                                        auto_ocr_options: {
                                            ...selectedTargetRegion.auto_ocr_options,
                                            enabled: event.target.checked,
                                        }
                                    }

                                    updateTargetRegion( updatedRegion );
                                    setSelectedTargetRegion( updatedRegion );
                                }}
                            /> 
                        }
                    />

                    <FormControlLabel label='Refresh All Regions'
                        sx={{ ml: 0,  mt: 0, mb: 1, width: '100%' }}
                        disabled={ !Boolean( selectedTargetRegion?.auto_ocr_options?.enabled ) }
                        control={
                            <Switch
                                checked={ Boolean( selectedTargetRegion?.auto_ocr_options?.refresh_all_regions ) }
                                onChange={ ( event ) => {
                                    console.log( event.target.checked )

                                    const updatedRegion = {
                                        ...selectedTargetRegion,
                                        auto_ocr_options: {
                                            ...selectedTargetRegion.auto_ocr_options,
                                            refresh_all_regions: event.target.checked,
                                        }
                                    }

                                    updateTargetRegion( updatedRegion );
                                    setSelectedTargetRegion( updatedRegion );
                                }}
                            /> 
                        }
                    />

                    <OcrSettingsSlider
                        label="Motion Sensitivity"
                        title="A higher value means the system will respond to smaller changes, while a lower value means only larger changes will be detected"
                        disabled={ !Boolean( selectedTargetRegion?.auto_ocr_options?.enabled ) }
                        min={0}
                        max={100}
                        value={ motionSensitivity ? motionSensitivity * 100 : 0 }
                        step={0.01}
                        leftLabel="Low"
                        rightLabel="High"
                        onChange={ ( event, newValue ) => {
                            if (typeof newValue === 'number') {
                                setSelectedTargetRegion({
                                    ...selectedTargetRegion,
                                    auto_ocr_options: {
                                        ...selectedTargetRegion.auto_ocr_options,
                                        motion_sensitivity: newValue > 0 ? newValue / 100 : 0
                                    }
                                })
                            }
                        }}
                        onChangeCommitted={ () => {
                            updateTargetRegion({
                                ...selectedTargetRegion,
                                auto_ocr_options: {
                                    ...selectedTargetRegion.auto_ocr_options,
                                }
                            });
                        }}
                        reset={ () => {
                            const data = {
                                ...selectedTargetRegion,
                                auto_ocr_options: {
                                    ...selectedTargetRegion.auto_ocr_options,
                                    motion_sensitivity: 0.5
                                }
                            };
                            setSelectedTargetRegion(data);
                            updateTargetRegion(data);
                        }}
                    />

                    <OcrSettingsSlider
                        label="Number of Frames"
                        title="Number of frames used for motion detection. Higher values can filter out slow and gradual changes."
                        disabled={ !Boolean( selectedTargetRegion?.auto_ocr_options?.enabled ) }
                        min={3}
                        max={30}
                        value={ frameSampleSize }
                        step={1}
                        leftLabel="Low"
                        rightLabel="High"
                        onChange={ ( event, newValue ) => {
                            if (typeof newValue === 'number') {
                                setSelectedTargetRegion({
                                    ...selectedTargetRegion,
                                    auto_ocr_options: {
                                        ...selectedTargetRegion.auto_ocr_options,
                                        frame_sample_size: newValue 
                                    }
                                })
                            }
                        }}
                        onChangeCommitted={ () => {
                            updateTargetRegion({
                                ...selectedTargetRegion,
                                auto_ocr_options: {
                                    ...selectedTargetRegion.auto_ocr_options,
                                }
                            });
                        }}
                        reset={ () => {
                            const data = {
                                ...selectedTargetRegion,
                                auto_ocr_options: {
                                    ...selectedTargetRegion.auto_ocr_options,
                                    frame_sample_size: 8
                                }
                            };
                            setSelectedTargetRegion(data);
                            updateTargetRegion(data);
                        }}
                    />

                    <OcrSettingsSlider
                        label="Capture Maximum framerate"
                        title="Maximum number of frames per second. This parameter is shared"
                        disabled={ !Boolean( selectedTargetRegion?.auto_ocr_options?.enabled ) }
                        min={1}
                        max={10}
                        value={ maximumFrameRate }
                        step={1}
                        onChange={ ( event, newValue ) => {
                            if (typeof newValue === 'number') {

                                setMaximumFrameRate( newValue );

                                newValue = 1000 / newValue;
                            }
                        }}
                        onChangeCommitted={ () => {
                            const intervalBetweenFrames = 1000 / maximumFrameRate;
                            global.ipcRenderer.invoke('screen_capturer:set_interval', intervalBetweenFrames );
                            updateOcrTemplate({
                                ...activeOcrTemplate,
                                capturer_options: {
                                    ...activeOcrTemplate.capturer_options,
                                    interval_between_frames: intervalBetweenFrames
                                }
                            });
                        }}
                        reset={ () => {
                            const interval_between_frames = 1000 / 3;
                            updateOcrTemplate({
                                ...activeOcrTemplate,
                                capturer_options: {
                                    ...activeOcrTemplate.capturer_options,
                                    interval_between_frames
                                }
                            });
                            global.ipcRenderer.invoke('screen_capturer:set_interval', interval_between_frames );
                            setMaximumFrameRate(3);
                        }}
                    />

                </CustomAccordion>

                <CustomAccordion style={accordionStyle} disabled={ !Boolean(selectedTargetRegion) }
                    summary={
                        <Typography fontSize={'1.1rem'}>
                            Text-to-Speech
                        </Typography>
                    }
                    detailsSx={{ pl: 3, pr: 3 }}
                >

                    <Autocomplete autoHighlight
                        fullWidth
                        renderInput={ (params) => {
                            return <TextField {...params}
                                label='Voice'
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: <RecordVoiceOverIcon sx={{ mr: '10px' }}/>,
                                    style: { paddingLeft: '14px' }
                                }}
                            />
                        }}
                        value={ targetRegionTTSVoiceName }
                        onChange={( event: any, newValue: string | null ) => {

                            const voice_uri = getVoices()
                                ?.find( item => item.name === newValue )
                                ?.voiceURI;

                            // handleLanguageSelectChange( newValue );
                            const updatedRegion = {
                                ...selectedTargetRegion,
                                text_to_speech_options: {
                                    ...selectedTargetRegion.text_to_speech_options,
                                    voice_uri
                                }
                            }

                            updateTargetRegion( updatedRegion );
                            setSelectedTargetRegion( updatedRegion );
                        }}
                        options={ ttsVoiceOptions }
                        sx={{ mb: '25px' }}
                        ListboxProps={{
                            style: {
                                backgroundColor: '#121212',
                            }
                        }}
                    />

                    <OcrSettingsSlider
                        label="Volume"
                        min={0}
                        max={100}
                        value={ Number( selectedTargetRegion?.text_to_speech_options?.volume ) * 100 }
                        step={1}
                        onChange={ ( event, newValue ) => {
                            if (typeof newValue === 'number') {

                                newValue = newValue / 100;

                                setSelectedTargetRegion({
                                    ...selectedTargetRegion,
                                    text_to_speech_options: {
                                        ...selectedTargetRegion.text_to_speech_options,
                                        volume: newValue
                                    }
                                })
                            }
                        }}
                        onChangeCommitted={ () => {
                            updateTargetRegion({
                                ...selectedTargetRegion,
                                text_to_speech_options: {
                                    ...selectedTargetRegion.text_to_speech_options,
                                }
                            });
                        }}
                    />

                    <OcrSettingsSlider
                        label="Speed"
                        min={0.1}
                        max={10}
                        value={ Number( selectedTargetRegion?.text_to_speech_options?.speed )  }
                        step={0.1}
                        onChange={ ( event, newValue ) => {
                            if (typeof newValue === 'number') {

                                setSelectedTargetRegion({
                                    ...selectedTargetRegion,
                                    text_to_speech_options: {
                                        ...selectedTargetRegion.text_to_speech_options,
                                        speed: newValue
                                    }
                                })
                            }
                        }}
                        onChangeCommitted={ () => {
                            updateTargetRegion({
                                ...selectedTargetRegion,
                                text_to_speech_options: {
                                    ...selectedTargetRegion.text_to_speech_options,
                                }
                            });
                        }}
                    />

                    <OcrSettingsSlider
                        label="Pitch"
                        min={0}
                        max={2}
                        value={ Number( selectedTargetRegion?.text_to_speech_options?.pitch ) }
                        step={0.05}
                        onChange={ ( event, newValue ) => {
                            if (typeof newValue === 'number') {

                                setSelectedTargetRegion({
                                    ...selectedTargetRegion,
                                    text_to_speech_options: {
                                        ...selectedTargetRegion.text_to_speech_options,
                                        pitch: newValue
                                    }
                                })
                            }
                        }}
                        onChangeCommitted={ () => {
                            updateTargetRegion({
                                ...selectedTargetRegion,
                                text_to_speech_options: {
                                    ...selectedTargetRegion.text_to_speech_options,
                                }
                            });
                        }}
                    />

                    <FormControlLabel label='Autoplay'
                        // title=''
                        sx={{ ml: 0,  mt: 0, mb: 1, width: '100%' }}
                        control={
                            <Switch
                                checked={ Boolean( selectedTargetRegion?.text_to_speech_options?.automatic ) }
                                onChange={ ( event ) => {

                                    const updatedRegion = {
                                        ...selectedTargetRegion,
                                        text_to_speech_options: {
                                            ...selectedTargetRegion.text_to_speech_options,
                                            automatic: event.target.checked
                                        }
                                    }

                                    updateTargetRegion( updatedRegion );
                                    setSelectedTargetRegion( updatedRegion );
                                }}
                            /> 
                        }
                    />

                    <FormControlLabel label='Play on click'
                        // title=''
                        sx={{ ml: 0,  mt: 0, mb: 1, width: '100%' }}
                        control={
                            <Switch
                                checked={ Boolean( selectedTargetRegion?.text_to_speech_options?.on_click ) }
                                onChange={ ( event ) => {

                                    const updatedRegion = {
                                        ...selectedTargetRegion,
                                        text_to_speech_options: {
                                            ...selectedTargetRegion.text_to_speech_options,
                                            on_click: event.target.checked
                                        }
                                    }

                                    updateTargetRegion( updatedRegion );
                                    setSelectedTargetRegion( updatedRegion );
                                }}
                            /> 
                        }
                    />

                    <FormControlLabel label='Play on hover'
                        // title=''
                        sx={{ ml: 0,  mt: 0, mb: 1, width: '100%' }}
                        control={
                            <Switch
                                checked={ Boolean( selectedTargetRegion?.text_to_speech_options?.on_hover ) }
                                onChange={ ( event ) => {

                                    const updatedRegion = {
                                        ...selectedTargetRegion,
                                        text_to_speech_options: {
                                            ...selectedTargetRegion.text_to_speech_options,
                                            on_hover: event.target.checked
                                        }
                                    }

                                    updateTargetRegion( updatedRegion );
                                    setSelectedTargetRegion( updatedRegion );
                                }}
                            /> 
                        }
                    />
                </CustomAccordion>

            </Container>
        </> }
    </> )

}