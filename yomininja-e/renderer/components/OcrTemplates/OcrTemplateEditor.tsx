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
import { ipcRenderer } from "../../utils/ipc-renderer";
import AutoOcrOptions from "./AutoOcrOptions";
import TTSOptions from "./TTSOptions";

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

    const { activeCaptureSource } = useContext( CaptureSourceContext );
    const [ templateSize, setTemplateSize ] = useState< Size >();
    const [ selectedTargetRegion, setSelectedTargetRegion ] = useState< OcrTargetRegionJson | null >();

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
                    <AutoOcrOptions
                        activeCaptureSource={activeCaptureSource}
                        selectedTargetRegion={selectedTargetRegion}
                        setSelectedTargetRegion={setSelectedTargetRegion}
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

                    <TTSOptions
                        selectedTargetRegion={selectedTargetRegion}
                        setSelectedTargetRegion={setSelectedTargetRegion}
                    />
                </CustomAccordion>

            </Container>
        </> }
    </> )

}