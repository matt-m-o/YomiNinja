import { CSSProperties, useContext, useEffect, useState } from "react";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { styled } from "@mui/material";
import { OcrItemScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayBehavior, OverlayHotkeys, OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset";


const OcrResultBox = styled('div')({
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
    const [ hoveredText, setHoveredText ] = useState< string >('asdf');
    
    const [ hoveredElement, setHoveredElement ] = useState< HTMLElement | null >( null );
    
    function createOcrResultBox( item: OcrItemScalable, idx: number ): JSX.Element {

        const { box } = item;

        const OcrResultBox_WithSettings = styled( OcrResultBox )({
            ":hover": {
                fontFamily: "arial",
                backgroundColor: ocrItemBoxVisuals?.background_color || 'black',
                color: ocrItemBoxVisuals?.text.color || 'white',
            },
            borderColor: ocrItemBoxVisuals?.border_color || 'red',
            borderWidth: ocrItemBoxVisuals?.border_width || '1px',
            borderRadius: ocrItemBoxVisuals?.border_radius || '2rem',
        });        

        return (
            <OcrResultBox_WithSettings key={idx}
                style={{                    
                    left: box.position.left + '%',
                    top: box.position.top + '%',
                    transform: `rotate( ${box.angle_degrees}deg )`,
                    minWidth: box.dimensions.width + '%',
                    minHeight: box.dimensions.height + '%',
                    fontSize: box.dimensions.height * 50 + '%',
                }}                          
                onMouseEnter={ () => ( setHoveredText( item.text ) ) }
            >
                { item.text }
            </OcrResultBox_WithSettings>
        )
    }


    useEffect( () => {

        const handleMouseOver = ( e: MouseEvent ) => {
            setHoveredElement( e.target as HTMLElement );
        };

        const handleMouseOut = () => {
            setHoveredElement( null );
        };

        document.addEventListener( 'mouseover', handleMouseOver );
        document.addEventListener( 'mouseout', handleMouseOut );

        return () => {
            document.removeEventListener( 'mouseover', handleMouseOver );
            document.removeEventListener( 'mouseout', handleMouseOut );
        };
    }, []);

    useEffect(() => {

        console.log('hoveredElement');

        if ( !overlayHotkeys?.copy_text && hoveredElement )
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
            if ( e.key === copyTextHotkey && hoveredElement ) {
                global.ipcRenderer.invoke( 'user_command:copy_to_clipboard', hoveredText );
            }
        };        

        document.addEventListener('keyup', handleKeyPress);

        return () => {
            document.removeEventListener('keyup', handleKeyPress);
        };

    }, [ hoveredText, global.ipcRenderer ]);

    useEffect( () => {

        console.log({ hoveredText });

        if ( 
            overlayBehavior?.copy_text_on_hover &&
            hoveredText
        )
            global.ipcRenderer.invoke( 'user_command:copy_to_clipboard', hoveredText );

    }, [ hoveredText ] );

    return (
        <>
            { ocrResult?.results?.map( createOcrResultBox ) }        
        </> 
    );
}