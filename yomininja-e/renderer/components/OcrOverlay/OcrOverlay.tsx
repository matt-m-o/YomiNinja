import { useContext, useState, useEffect } from "react";
import { OverlayOcrItemBoxVisuals, OverlayFrameVisuals, OverlayHotkeys, OverlayBehavior } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import { SettingsContext } from "../../context/settings.provider";
import { debounce, styled } from "@mui/material";
import FullscreenOcrResult from "./FullscreenOcrResult";
import { DictionaryContext } from "../../context/dictionary.provider";


const OverlayFrame = styled('div')({
    border: 'solid 1px',
    height: '100vh',
    overflow: 'hidden',
    boxSizing: 'border-box'
});

export default function OcrOverlay() {

    const {
      activeSettingsPreset,
    } = useContext( SettingsContext );
    const { toggleScanner } = useContext( DictionaryContext );

    const ocrItemBoxVisuals: OverlayOcrItemBoxVisuals = activeSettingsPreset?.overlay?.visuals.ocr_item_box;
    const overlayFrameVisuals: OverlayFrameVisuals = activeSettingsPreset?.overlay?.visuals.frame;
    const overlayHotkeys: OverlayHotkeys = activeSettingsPreset?.overlay?.hotkeys;
    const overlayBehavior: OverlayBehavior = activeSettingsPreset?.overlay?.behavior;


    useEffect( () => {

      if ( !activeSettingsPreset ) return;

      const { enabled } = activeSettingsPreset.dictionary;
      toggleScanner( enabled );

    }, [activeSettingsPreset] );

    function handleClickThrough( event: MouseEvent ) {
      
      const element = document.elementFromPoint(
        event.clientX,
        event.clientY
      );

      let value = false;

      if (
        element.id === 'overlay-frame' ||
        element.id === 'ocr-region'
      )
        value = true;
      else
        value = false;
      
      // console.log( currentElement );
      // console.log( value );

      global.ipcRenderer.invoke( 'overlay:set_ignore_mouse_events', value );
    };


    useEffect( () => {

      document.addEventListener( 'mousemove', handleClickThrough );

      return () => {
        document.removeEventListener( 'mousemove', handleClickThrough );
      };

    }, [] );


    return (
        <OverlayFrame id='overlay-frame'
            sx={{
              borderColor: overlayFrameVisuals?.border_color || 'red',
              borderWidth: overlayFrameVisuals?.border_width || '1px'
            }}
          >

            <FullscreenOcrResult 
              ocrItemBoxVisuals={ocrItemBoxVisuals}
              overlayHotkeys={overlayHotkeys}
              overlayBehavior={overlayBehavior}
            />

        </OverlayFrame>
    )
}