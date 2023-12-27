import { CSSProperties, useContext, useEffect, useState } from "react";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { styled } from "@mui/material";
import { OcrItemScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayBehavior, OverlayHotkeys, OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import { DictionaryContext } from "../../context/dictionary.provider";


const BaseOcrResultBox = styled('div')({
    border: 'solid',
    position: 'absolute',
    color: 'transparent',
    transformOrigin: 'top left',
    paddingLeft: '0.5%',
    paddingRight: '0.5%',
    textAlign: 'center',
    letterSpacing: '0.1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',    
});

export type FullscreenOcrResultProps = {
    ocrItemBoxVisuals: OverlayOcrItemBoxVisuals;
    overlayHotkeys: OverlayHotkeys;
    overlayBehavior: OverlayBehavior;
};


export default function FullscreenOcrResult( props: FullscreenOcrResultProps ) {

    const { ocrItemBoxVisuals, overlayHotkeys, overlayBehavior } = props;

    const { ocrResult } = useContext( OcrResultContext );
    const [ hoveredText, setHoveredText ] = useState< string >('');

    useEffect( () => {

        // console.log({ hoveredText });

        if ( 
            overlayBehavior?.copy_text_on_hover &&
            hoveredText
        ) {
            global.ipcRenderer.invoke( 'user_command:copy_to_clipboard', hoveredText );
        }

    }, [ hoveredText ] );

    const handleBoxMouseEnter = ( item: OcrItemScalable ) => {
        if ( !overlayBehavior.copy_text_on_hover )
            return;
        setHoveredText( item.text )
    }

    const handleBoxMouseLeave = () => {
        if ( !overlayBehavior.copy_text_on_hover )
            return;
        setHoveredText( '' );
    }

    function OcrResultBox( props: { ocrItem: OcrItemScalable } ): JSX.Element {

        const { ocrItem } = props;

        const { box } = ocrItem;

        let isVertical = box.dimensions.height > ( box.dimensions.width * 1.40 );

        const fontSize = isVertical ? box.dimensions.width * 90 : box.dimensions.height * 65;

        if ( box.angle_degrees < -70 )
            isVertical = true;

        const Box = styled( BaseOcrResultBox )({            
            ":hover": {
                fontFamily: "arial",
                backgroundColor: ocrItemBoxVisuals?.background_color || 'black',
                color: ocrItemBoxVisuals?.text.color || 'white',
            },
            borderColor: ocrItemBoxVisuals?.border_color || 'red',
            borderWidth: ocrItemBoxVisuals?.border_width || '0px',
            borderRadius: ocrItemBoxVisuals?.border_radius || '2rem',
            writingMode: isVertical ? 'vertical-rl' :'inherit',
            textOrientation: isVertical ? 'upright' :'inherit',
        });

        const { width } = box.dimensions;
        const { left } = box.position;
        const minWidth = width + left > 100 ? 100 - left : width;

        return (
            <Box className="extracted-text"
                style={{
                    left: box.position.left + '%',
                    top: box.position.top * 0.994 + '%',
                    transform: `rotate( ${box.angle_degrees}deg )`,
                    minWidth: minWidth + '%',
                    minHeight: box.dimensions.height + '%',
                    maxHeight: box.dimensions.height *1.10 + '%',            
                    fontSize: fontSize + '%',
                }}                          
                onMouseEnter={ () => handleBoxMouseEnter( ocrItem ) }
                onMouseLeave={ () => handleBoxMouseLeave() }
                onClick={ () => handleBoxClick( ocrItem.text ) }
                // onMouseMove={ ( event ) => onMouseMoveHandler(event) }
            >
                { ocrItem.text }
            </Box>
        )
    }

    function handleBoxClick( text: string ) {
        
        if ( !overlayBehavior.copy_text_on_click || !text )
            return;

        // console.log( { text } );
        global.ipcRenderer.invoke( 'user_command:copy_to_clipboard', text );
    }

    return (
        <>
            { ocrResult?.results?.map(
                ( item, idx ) => <OcrResultBox ocrItem={item} key={idx} />
            )}
        </>
    );
}