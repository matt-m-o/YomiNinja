import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { styled } from "@mui/material";
import { OcrItemScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayBehavior, OverlayHotkeys, OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import { DictionaryContext } from "../../context/dictionary.provider";


const BaseOcrResultBox = styled('div')({
    // border: 'solid',
    outline: 'solid',
    position: 'absolute',
    fontFamily: "arial",
    // color: 'transparent',
    contentVisibility: 'hidden',
    transformOrigin: 'top left',
    paddingLeft: '0.25%',
    paddingRight: '0.25%',
    textAlign: 'center',
    // letterSpacing: '0.1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'auto'
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

    function OcrResultBox( props: {
        ocrItem: OcrItemScalable,
        ocrRegionSize: { // Pixels
            width: number;
            height: number;
        }
    } ): JSX.Element {

        const boxRef = useRef(null);

        const [ alignItems, setAlignItems ] = useState('center');

        useEffect( () => {

            if ( !boxRef?.current ) return;
            
            const observer = new MutationObserver( ( mutations ) => {
                mutations.forEach( ( mutation ) => {

                    if ( mutation.type !== 'childList' ) 
                        return;

                    const addedNodes = Array.from( mutation.addedNodes );

                    if ( !addedNodes.some( node => node.nodeName === 'RUBY' ) ) 
                        return;

                    console.log('A <ruby> child was added!');
                    setAlignItems( 'flex-end' );                                        
                });
            });
        
            observer.observe( boxRef.current, { childList: true, subtree: true } );
    
            return () => observer.disconnect();
        }, [] );
        

        const { ocrItem, ocrRegionSize } = props;

        const { box } = ocrItem;

        let isVertical = box.dimensions.height > ( box.dimensions.width * 1.40 );

        // const fontSize = isVertical ? box.dimensions.width * 90 : box.dimensions.height * 65;

        const regionWidthPx = ocrRegionSize.width * window.innerWidth;
        const regionHeightPx = ocrRegionSize.height * window.innerHeight;

        const boxWidthPx = regionWidthPx * ( box.dimensions.width / 100 );
        const boxHeightPx = regionHeightPx * ( box.dimensions.height / 100 );

        const fontSize = isVertical ? boxWidthPx * 0.7 : boxHeightPx * 0.75; // Pixels

        let { font_size_factor } = ocrItemBoxVisuals.text;

        if ( isVertical )
            font_size_factor = font_size_factor * 1.10;

        const fontSizeOffset =  ( fontSize * ( font_size_factor / 100 ) ) - fontSize;

        if ( box.angle_degrees < -70 )
            isVertical = true;

        const adjustedFontSize = fontSize + fontSizeOffset; // px

        const Box = styled( BaseOcrResultBox )({            
            ":hover": {
                backgroundColor: ocrItemBoxVisuals?.background_color || 'black',
                color: ocrItemBoxVisuals?.text.color || 'white',
                fontSize: adjustedFontSize + 'px', // isVertical ? fontSize * 0.8 : fontSize * 0.85
                lineHeight: adjustedFontSize + 'px',
                letterSpacing: ocrItemBoxVisuals.text.letter_spacing || 'inherit',
                paddingLeft: isVertical ? 0 : '0.25%',
                paddingRight: isVertical ? 0 : '0.25%',
                contentVisibility: 'visible',
                zIndex: 10,
            },
            outlineColor: ocrItemBoxVisuals?.border_color || 'red',
            outlineWidth: ocrItemBoxVisuals?.border_width || '0px',
            borderRadius: ocrItemBoxVisuals?.border_radius || '0rem',
            writingMode: isVertical ? 'vertical-rl' :'inherit',
            textOrientation: isVertical ? 'upright' :'inherit',
            fontSize: fontSize + 'px',
            lineHeight: fontSize + 'px',
            contentVisibility: 'hidden',
            alignItems
        });

        const { width } = box.dimensions;
        const { left } = box.position;
        const minWidth = width + left > 100 ? 100 - left : width;

        const bottom = 100 - box.position.top - box.dimensions.height;

        return (
            <Box className="extracted-text" ref={boxRef}
                style={{
                    left: ( box.position.left - 0.25 ) + '%',
                    // top: (box.position.top * 0.999) + '%',
                    bottom: bottom * 0.999 + '%',
                    transform: `rotate( ${box.angle_degrees}deg )`,
                    minWidth: minWidth + '%',
                    minHeight: box.dimensions.height + '%',
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

    return ( <>
        { ocrResult?.ocr_regions?.map(
            ( ocrRegion, regionIdx ) => (
                <div className="ocr-region" key={regionIdx}
                    style={{
                        // border: 'solid 2px yellow',
                        position: 'absolute',
                        top: ( ocrRegion.position.top * 100 ) + "%",
                        left: ( ocrRegion.position.left * 100 ) + "%",
                        width: ( ocrRegion.size.width * 100 ) + "%",
                        height: ( ocrRegion.size.height * 100 ) + "%",
                        boxSizing: 'border-box'
                    }}
                >
                    {
                        ocrRegion.results.map( ( item, resultIdx ) => (
                            <OcrResultBox 
                                key={resultIdx}
                                ocrItem={item}
                                ocrRegionSize={ocrRegion.size}
                            />
                        ))
                    }
                </div>
            )
        )}
    </> );
}