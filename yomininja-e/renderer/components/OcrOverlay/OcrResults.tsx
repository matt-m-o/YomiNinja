import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { styled } from "@mui/material";
import { OcrItemScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayBehavior, OverlayHotkeys, OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import { DictionaryContext } from "../../context/dictionary.provider";
import OcrResultBox from "./OcrResultBox";

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


    function handleBoxClick( item: OcrItemScalable ) {
        
        if ( !overlayBehavior.copy_text_on_click || !item?.text )
            return;

        // console.log( { text } );
        global.ipcRenderer.invoke( 'user_command:copy_to_clipboard', item.text );
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
                        ocrRegion.results.map( ( item, resultIdx ) => {
                            if ( !item?.text ) return;
                            return (
                                <OcrResultBox 
                                    key={resultIdx}
                                    ocrItem={item}
                                    ocrRegionSize={ocrRegion.size}
                                    ocrItemBoxVisuals={ocrItemBoxVisuals}
                                    overlayBehavior={overlayBehavior}
                                    overlayHotkeys={overlayHotkeys}
                                    onClick={ handleBoxClick }
                                    onMouseEnter={ handleBoxMouseEnter }
                                    onMouseLeave={ handleBoxMouseLeave }
                                />
                            )
                        })
                    }
                </div>
            )
        )}
    </> );
}