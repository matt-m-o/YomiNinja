import { useContext, useState, useEffect } from "react";
import { OverlayOcrItemBoxVisuals, OverlayFrameVisuals, OverlayHotkeys, OverlayBehavior, OverlayMouseVisuals, OverlayOcrRegionVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import { SettingsContext } from "../../context/settings.provider";
import { debounce } from "@mui/material";
import { styled } from "@mui/material/styles";
import FullscreenOcrResult from "./OcrResults";
import { DictionaryContext } from "../../context/dictionary.provider";
import CustomCursor from "./CustomCursor/CustomCursor";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { OcrTemplateJson } from "../../../electron-src/@core/domain/ocr_template/ocr_template";
import { OcrTargetRegionDiv, toCssPercentage } from "../OcrTemplates/OcrTargetRegion";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";


const OverlayFrame = styled('div')({
  border: 'solid 1px',
  height: '100vh',
  overflow: 'hidden',
  boxSizing: 'border-box',
});

export default function OcrOverlay() {

  const { activeSettingsPreset } = useContext( SettingsContext );
  const { toggleScanner } = useContext( DictionaryContext );
  const { activeOcrTemplate } = useContext( OcrTemplatesContext );
  

  const { ocrResult, showResults } = useContext( OcrResultContext );

  const ocrItemBoxVisuals: OverlayOcrItemBoxVisuals = activeSettingsPreset?.overlay?.visuals.ocr_item_box;
  const overlayFrameVisuals: OverlayFrameVisuals = activeSettingsPreset?.overlay?.visuals.frame;
  const overlayOcrRegionVisuals: OverlayOcrRegionVisuals = activeSettingsPreset?.overlay?.visuals.ocr_region;
  const overlayMouseVisuals: OverlayMouseVisuals = activeSettingsPreset?.overlay?.visuals.mouse;
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
      element.classList.contains('ocr-region')
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


  const templateRegions = activeOcrTemplate?.target_regions.map( region => {
    const { position, size } = region;
    return (
        <OcrTargetRegionDiv className="ocr-region" key={ region.id }
          style={{
            border: 'solid',
            borderColor: overlayFrameVisuals?.border_color || 'red',
            borderWidth: overlayOcrRegionVisuals?.border_width + 'px',
            top: toCssPercentage( position.top ),
            left: toCssPercentage( position.left ),
            width: toCssPercentage( size.width ),
            height: toCssPercentage( size.height ),
            zIndex: -10
          }}
        />
    );
  });

  return (
    <OverlayFrame id='overlay-frame'
      sx={{
        borderColor: overlayFrameVisuals?.border_color || 'red',
        borderWidth: overlayFrameVisuals?.border_width + 'px',
        contentVisibility: showResults ? 'visible' : 'hidden'
      }}
    >
      {templateRegions}
      <FullscreenOcrResult
        ocrItemBoxVisuals={ocrItemBoxVisuals}
        overlayHotkeys={overlayHotkeys}
        overlayBehavior={overlayBehavior}
      />

      { overlayMouseVisuals?.show_custom_cursor && ocrResult &&
        <CustomCursor size={ overlayMouseVisuals.custom_cursor_size }/>
      }

    </OverlayFrame>
  )
}