import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { styled } from "@mui/material";
import { OcrItemScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayBehavior, OverlayHotkeys, OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
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
    
    const [ editableBoxId, setEditableBoxId ] = useState< string | undefined >(undefined);


    const handleBoxMouseEnter = ( item: OcrItemScalable ) => {
        
        const hoveredText = item.text.map( line => line.content ).join(' ');
        // console.log({ hoveredText });

        sendHoveredText( hoveredText );

        if (
            !overlayBehavior?.copy_text_on_hover ||
            !hoveredText
        )
            return;
        
        copyText( hoveredText );
    }

    const handleBoxMouseLeave = () => {
        sendHoveredText( '' );
    }

    const sendHoveredText = ( hoveredText: string ) => {
        global.ipcRenderer.invoke( 'overlay:set_hovered_text', hoveredText );
    }

    const copyText = ( text: string ) => {
        global.ipcRenderer.invoke( 'user_command:copy_to_clipboard', text );
    }


    function handleBoxClick( item: OcrItemScalable ) {
        
        if ( !overlayBehavior.copy_text_on_click || !item?.text )
            return;

        const text = item.text.map( line => line.content ).join(' ');

        copyText( text );;
    }

    function handleBoxDoubleClick( id: string | undefined ) {
        setEditableBoxId( id );
        // console.log({ id })
    }

    function handleBoxBlur() {
        // if ( !editableBoxId ) return;
        setEditableBoxId( undefined );
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

                            const id = `${regionIdx}/${resultIdx}`;

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
                                    onDoubleClick={ () => handleBoxDoubleClick( id ) }
                                    onBlur={ handleBoxBlur }
                                    contentEditable={ editableBoxId === id }
                                />
                            )
                        })
                    }
                </div>
            )
        )}
    </> );
}