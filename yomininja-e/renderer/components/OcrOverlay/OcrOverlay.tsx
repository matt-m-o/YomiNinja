import { useContext, useState, useEffect } from "react";
import {
  OverlayOcrItemBoxVisuals,
  OverlayFrameVisuals,
  OverlayHotkeys,
  OverlayBehavior,
  OverlayMouseVisuals,
  OverlayOcrRegionVisuals,
  OverlayIndicatorsVisuals
} from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { SettingsContext } from "../../context/settings.provider";
import { CircularProgress, Typography, debounce } from "@mui/material";
import { styled } from "@mui/material/styles";
import FullscreenOcrResult from "./OcrResults";
import { DictionaryContext } from "../../context/dictionary.provider";
import CustomCursor from "./CustomCursor/CustomCursor";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { OcrTemplateJson } from "../../../electron-src/@core/domain/ocr_template/ocr_template";
import { OcrTargetRegionDiv, toCssPercentage } from "../OcrTemplates/OcrTargetRegion";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import ProcessingIndicator from "./ProcessingIndicator";


const OverlayFrame = styled('div')({
  border: 'solid 1px',
  height: '100vh',
  overflow: 'hidden',
  boxSizing: 'border-box',
  '-webkit-app-region': 'no-drag'
});

const ProgressContainer = styled('div')({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyItems:'center', 
  right: '2%',
  bottom: '5%'

});

const DragArea = styled('div')({
  width: '100%',
  height: '100%',
  backgroundColor: '#00000092',
  '-webkit-app-region': 'drag',
  cursor: 'move',
  position: 'relative',
  zIndex: 999999999
});

export default function OcrOverlay() {

  const { activeSettingsPreset } = useContext( SettingsContext );
  const { toggleScanner } = useContext( DictionaryContext );
  const { activeOcrTemplate } = useContext( OcrTemplatesContext );
  

  const { ocrResult, showResults, processing } = useContext( OcrResultContext );

  const ocrItemBoxVisuals: OverlayOcrItemBoxVisuals = activeSettingsPreset?.overlay?.visuals.ocr_item_box;
  const overlayFrameVisuals: OverlayFrameVisuals = activeSettingsPreset?.overlay?.visuals.frame;
  const overlayOcrRegionVisuals: OverlayOcrRegionVisuals = activeSettingsPreset?.overlay?.visuals.ocr_region;
  const overlayMouseVisuals: OverlayMouseVisuals = activeSettingsPreset?.overlay?.visuals.mouse;
  const overlayIndicatorsVisuals: OverlayIndicatorsVisuals = activeSettingsPreset?.overlay?.visuals.indicators;
  const overlayHotkeys: OverlayHotkeys = activeSettingsPreset?.overlay?.hotkeys;
  const overlayBehavior: OverlayBehavior = activeSettingsPreset?.overlay?.behavior;

  let [ showDragArea, setShowDragArea ] = useState(false);

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

    if ( showDragArea || element.id === 'drag-area' )
      value = false;
    
    // console.log( currentElement );
    // console.log( value );

    global.ipcRenderer.invoke( 'overlay:set_ignore_mouse_events', value );
  };

  useEffect( () => {

    document.addEventListener( 'mousemove', handleClickThrough );
    
    if ( !window ) return;

    global.ipcRenderer.on( 'set_movable', ( event, value ) => {
      console.log({ value })
      setShowDragArea( value );
    });

    return () => {
      document.removeEventListener( 'mousemove', handleClickThrough );
      global.ipcRenderer.removeAllListeners( 'set_movable' );
    };

  }, [] );


  const templateRegions = activeOcrTemplate?.target_regions.map( region => {
    const { position, size } = region;
    return (
        <OcrTargetRegionDiv key={ region.id } // className="ocr-region" This class can break JPDBReader
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

  

  return ( <>
    <OverlayFrame id='overlay-frame'
      sx={{
        borderColor: overlayFrameVisuals?.border_color || 'red',
        borderWidth: overlayFrameVisuals?.border_width + 'px',
        contentVisibility: showResults ? 'visible' : 'hidden'
      }}
    >
      { showDragArea &&
        <DragArea id="drag-area">
          <Typography
            
            sx={{
              ml: 2,
              pt: 1,
              color: overlayFrameVisuals?.border_color || 'red',
            }}
          >
            The overlay is now movable and resizable!
          </Typography>
        </DragArea>
      }
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

    { processing &&
      <ProcessingIndicator
        color={ overlayIndicatorsVisuals?.processing_icon_color }
      />
    }
    
  </> )
}