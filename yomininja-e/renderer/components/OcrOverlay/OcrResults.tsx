import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { styled } from "@mui/material";
import { OcrItemScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayBehavior, OverlayHotkeys, OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { DictionaryContext } from "../../context/dictionary.provider";
import OcrResultBox from "./OcrResultBox";
import { TTSContext } from "../../context/text-to-speech.provider";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import { OcrTargetRegionJson } from "../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";

export type FullscreenOcrResultProps = {
    ocrItemBoxVisuals: OverlayOcrItemBoxVisuals;
    overlayHotkeys: OverlayHotkeys;
    overlayBehavior: OverlayBehavior;
};


export default function FullscreenOcrResult( props: FullscreenOcrResultProps ) {

    const { ocrItemBoxVisuals, overlayHotkeys, overlayBehavior } = props;

    const { ocrResult } = useContext( OcrResultContext );
    const { activeOcrTemplate } = useContext( OcrTemplatesContext );
    const { speak, getVoices } = useContext( TTSContext );
    
    const [ editableBoxId, setEditableBoxId ] = useState< string | undefined >(undefined);


    const handleBoxMouseEnter = ( item: OcrItemScalable, ocrRegionId?: string ) => {
        
        const hoveredText = getOcrItemText( item );
        // console.log({ hoveredText });
        // console.log({ ocrRegionId });

        const ocrRegion = getOcrTemplateTargetRegion( ocrRegionId );

        if ( ocrRegion?.text_to_speech_options?.on_hover ) {
            const { voice_uri, volume, speed, pitch } = ocrRegion.text_to_speech_options;
            speak({
                text: hoveredText,
                voiceURI: voice_uri,
                volume,
                speed,
                pitch,
                cancelCurrentText: true
            });
        }

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


    function handleBoxClick( item: OcrItemScalable, ocrRegionId: string ) {

        const hoveredText = getOcrItemText( item );
        const ocrRegion = getOcrTemplateTargetRegion( ocrRegionId );

        if ( ocrRegion?.text_to_speech_options?.on_click ) {
            const { voice_uri, volume, speed, pitch } = ocrRegion.text_to_speech_options;
            speak({
                text: hoveredText,
                voiceURI: voice_uri,
                volume,
                speed,
                pitch,
                cancelCurrentText: true
            });
        }

        
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

    function getOcrTemplateTargetRegion( ocrRegionId: string ): OcrTargetRegionJson | undefined {
        return activeOcrTemplate?.target_regions.find( 
            item => item.id === ocrRegionId
        );
    }

    function getOcrItemText( item: OcrItemScalable ) {
        return item.text.map( line => line.content ).join(' ');
    }

    return ( <>
        { ocrResult?.ocr_regions?.map(
            ( ocrRegion, regionIdx ) => {

                const ocrTemplateRegion = getOcrTemplateTargetRegion( ocrRegion.id );
            
                return (
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

                                if ( ocrTemplateRegion?.text_to_speech_options?.automatic ) {
                                    const { voice_uri, volume, speed, pitch } = ocrTemplateRegion.text_to_speech_options;
                                    const text = item.text.map( line => line.content ).join(' ');
                                    speak({
                                        text: item.text.map( line => line.content ).join(' '),
                                        voiceURI: voice_uri,
                                        volume, 
                                        speed,
                                        pitch,
                                        cancelCurrentText: resultIdx === 0,
                                    });
                                }

                                const id = `${regionIdx}/${resultIdx}`;

                                return (
                                    <OcrResultBox
                                        key={resultIdx}
                                        ocrItem={item}
                                        ocrRegionSize={ocrRegion.size}
                                        ocrRegionId={ocrRegion.id}
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
                );
            }
        )}
    </> );
}