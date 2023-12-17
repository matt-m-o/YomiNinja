import { styled } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import OcrTargetRegion from "./OcrTargetRegion";
import Moveable from "react-moveable";
import { OcrTargetRegionJson } from "../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import Selecto from "react-selecto";
import OcrTargetRegionMoveable from "./OcrTargetRegionMoveable";

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

export default function OcrTemplateEditor() {

    const {
        activeOcrTemplate,
        addTargetRegion,
        removeTargetRegion,
        updateTargetRegion,
    } = useContext( OcrTemplatesContext );

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

            if ( 
                !selectedTargetRegion?.id ||
                e.key !== 'Delete'
            ) return;
            
            removeTargetRegion( selectedTargetRegion.id );
        }

        document.addEventListener( 'keydown', handleKeyDown );

        return () => {
            document.removeEventListener( 'keydown', handleKeyDown );
        };
    }, [ selectedTargetRegion ] );
    

    return ( <>
        { activeOcrTemplate &&
            <TemplateDiv id='ocr-template-div' className='ocr-template-div'
                style={{
                    
                }}>

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

                        // console.log( e );

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
        }
    </> )

}