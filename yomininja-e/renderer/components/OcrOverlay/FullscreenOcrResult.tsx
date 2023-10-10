import { CSSProperties, useContext, useEffect, useState } from "react";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { styled } from "@mui/material";
import { OcrItemScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayBehavior, OverlayHotkeys, OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset";


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
    
    useEffect(() => {

        // console.log('hoveredElement');

        if ( !overlayHotkeys?.copy_text && hoveredText )
            return;

        let copyTextHotkey = overlayHotkeys?.copy_text
            .split('+')
            .find( value => value != 'undefined' );

        if ( !copyTextHotkey )
            return;

        if ( copyTextHotkey.length == 1 )
            copyTextHotkey = copyTextHotkey.toLowerCase();

        // console.log({ copyTextHotkey })

        const handleKeyPress = ( e: KeyboardEvent ) => {            

            // console.log(e.key);
            if ( e.key === copyTextHotkey && hoveredText ) {
                global.ipcRenderer.invoke( 'user_command:copy_to_clipboard', hoveredText );
            }
        };

        document.addEventListener('keyup', handleKeyPress);

        return () => {
            document.removeEventListener('keyup', handleKeyPress);
        };

    }, [ hoveredText, global.ipcRenderer ]);

    useEffect( () => {

        // console.log({ hoveredText });

        if ( 
            overlayBehavior?.copy_text_on_hover &&
            hoveredText
        )
            global.ipcRenderer.invoke( 'user_command:copy_to_clipboard', hoveredText );

    }, [ hoveredText ] );

    function OcrResultBox( props: { ocrItem: OcrItemScalable } ): JSX.Element {

        const { ocrItem } = props;

        const { box } = ocrItem;

        let isVertical = box.dimensions.height > ( box.dimensions.width * 1.40);

        const fontSize = isVertical ? box.dimensions.width * 90 : box.dimensions.height * 60;

        if ( box.angle_degrees < -70 )
            isVertical = true;

        const Box = styled( BaseOcrResultBox )({            
            ":hover": {
                fontFamily: "arial",
                backgroundColor: ocrItemBoxVisuals?.background_color || 'black',
                color: ocrItemBoxVisuals?.text.color || 'white',
            },
            borderColor: ocrItemBoxVisuals?.border_color || 'red',
            borderWidth: ocrItemBoxVisuals?.border_width || '1px',
            borderRadius: ocrItemBoxVisuals?.border_radius || '2rem',
            writingMode: isVertical ? 'vertical-rl' :'inherit',
            textOrientation: isVertical ? 'upright' :'inherit',
        });

        return (
            <Box
                style={{                    
                    left: box.position.left + '%',
                    top: box.position.top + '%',
                    transform: `rotate( ${box.angle_degrees}deg )`,
                    minWidth: box.dimensions.width + '%',
                    minHeight: box.dimensions.height + '%',
                    fontSize: fontSize + '%',
                }}                          
                onMouseEnter={ () => setHoveredText( ocrItem.text ) }
                onMouseLeave={ () => setHoveredText( '' ) }
            >
                { ocrItem.text }
            </Box>
        )
    }

    return (
        <>
            { ocrResult?.results?.map(
                ( item, idx ) => <OcrResultBox ocrItem={item} key={idx} />
            )}
        </>
    );
}