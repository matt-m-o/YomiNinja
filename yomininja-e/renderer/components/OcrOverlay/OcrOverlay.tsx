import { useContext, useState, useEffect } from "react";
import { OverlayOcrItemBoxVisuals, OverlayFrameVisuals, OverlayHotkeys, OverlayBehavior } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import { SettingsContext } from "../../context/settings.provider";
import { styled } from "@mui/material";
import FullscreenOcrResult from "./FullscreenOcrResult";


const OverlayFrame = styled('div')({
    border: 'solid 1px',
    height: '99.4vh',
    overflow: 'hidden',
});

export default function OcrOverlay() {

    const { activeSettingsPreset } = useContext( SettingsContext );

    const [ ocrItemBoxVisuals, setOcrItemBoxVisuals ] = useState<OverlayOcrItemBoxVisuals>();
    const [ overlayFrameVisuals, setOverlayFrameVisuals ] = useState<OverlayFrameVisuals>();
    const [ overlayHotkeys, setOverlayHotkeys ] = useState< OverlayHotkeys >();
    const [ overlayBehavior, setOverlayBehavior ] = useState< OverlayBehavior >();
    

    useEffect( () => {
  
      if ( !activeSettingsPreset )
          return;      
  
      const { ocr_item_box, frame } = activeSettingsPreset?.overlay?.visuals;
      const { hotkeys, behavior } = activeSettingsPreset?.overlay;
  
      if ( ocr_item_box && frame && hotkeys && behavior ) {
  
          setOcrItemBoxVisuals( ocr_item_box );
          setOverlayFrameVisuals( frame );
          setOverlayHotkeys( hotkeys );
          setOverlayBehavior( behavior );
      }
  
    }, [ activeSettingsPreset ] );

    return (
        <OverlayFrame
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