import { useContext, useState, useEffect } from "react";
import { OverlayOcrItemBoxVisuals, OverlayFrameVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import { SettingsContext } from "../../context/settings.provider";
import { styled } from "@mui/material";
import FullscreenOcrResult from "./FullscreenOcrResult";


const OverlayFrame = styled('div')({
    border: 'solid 1px',
    height: '99.8vh',
    overflow: 'hidden',
});

export default function OcrOverlay() {

    const { activeSettingsPreset } = useContext( SettingsContext );

    const [ ocrItemBoxVisuals, setOcrItemBoxVisuals ] = useState<OverlayOcrItemBoxVisuals>();
    const [ overlayFrameVisuals, setOverlayFrame ] = useState<OverlayFrameVisuals>();  
  
    useEffect( () => {
  
      if ( !activeSettingsPreset )
          return;      
  
      const { ocr_item_box, frame } = activeSettingsPreset?.overlay?.visuals;
  
      if ( ocr_item_box && frame ) {
  
          setOcrItemBoxVisuals( ocr_item_box );
          setOverlayFrame( frame );          
      }
  
    }, [ activeSettingsPreset ] );

    return (
        <OverlayFrame
            sx={{
              borderColor: overlayFrameVisuals?.border_color || 'red',
              borderWidth: overlayFrameVisuals?.border_width || '1px'
            }}
          >

            <FullscreenOcrResult />

        </OverlayFrame>
    )
}