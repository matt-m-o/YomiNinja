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
import { removeFurigana } from "../../utils/text_utils";
import { ipcRenderer } from "../../utils/ipc-renderer";
import { isElectronBrowser } from "../../utils/environment";
import { ProfileContext } from "../../context/profile.provider";

export type OcrResultsProps = {
    ocrItemBoxVisuals: OverlayOcrItemBoxVisuals;
    overlayHotkeys: OverlayHotkeys;
    overlayBehavior: OverlayBehavior;
};


export default function OcrResults( props: OcrResultsProps ) {

    const { ocrItemBoxVisuals, overlayHotkeys, overlayBehavior } = props;

    const { profile } = useContext( ProfileContext );
    const { ocrResult } = useContext( OcrResultContext );
    const { activeOcrTemplate } = useContext( OcrTemplatesContext );
    const { speak, getVoices } = useContext( TTSContext );
    
    const [ editableBoxId, setEditableBoxId ] = useState< string | undefined >(undefined);

    const isElectron = isElectronBrowser();

    const activeLang = profile?.active_ocr_language;

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
        ipcRenderer.invoke( 'overlay:set_hovered_text', hoveredText );
    }

    const copyText = ( text: string ) => {
        ipcRenderer.invoke( 'user_command:copy_to_clipboard', text );
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

        const text = getOcrItemText(item);

        copyText( text );
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
        let sep = '';
        if (
            !([ 'ja-JP', 'zh-Hans', 'zh-Hant', 'yue-Hans', 'yue-Hant' ]
            .some( tag => activeLang?.bcp47_tag === tag ))
        )
            sep = ' ';

        return item.text.map( line => line.content ).join(sep);
    }

    return ( <>
        { ocrResult?.ocr_regions?.map(
            ( ocrRegion, regionIdx ) => {

                const ocrTemplateRegion = getOcrTemplateTargetRegion( ocrRegion.id );

                const furiganaFilterThreshold = ocrItemBoxVisuals.text?.furigana_filter?.threshold;

                if ( Boolean( ocrItemBoxVisuals.text.furigana_filter?.enabled ) ) {
                    removeFurigana(ocrRegion.results, furiganaFilterThreshold || 0.6);
                }

                const regionStyle: CSSProperties ={
                    
                }
            
                return (
                    <div className="ocr-region ignore-mouse" key={regionIdx}
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
                        { typeof ocrRegion.image === 'string' && !isElectron &&
                            <img className="ignore-mouse"
                                src={ocrRegion.image}
                                style={{
                                    width: '100%',
                                    height: '99.8%',
                                    marginLeft: -1,
                                }}
                            />
                        }
                        {

                            ocrRegion.results.map( ( item, resultIdx ) => {
                                if ( !item?.text ) return;

                                if ( ocrTemplateRegion?.text_to_speech_options?.automatic ) {
                                    const { voice_uri, volume, speed, pitch } = ocrTemplateRegion.text_to_speech_options;
                                    const text = getOcrItemText( item );
                                    speak({
                                        text,
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