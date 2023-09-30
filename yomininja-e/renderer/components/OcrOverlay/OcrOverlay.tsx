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

    const ocrItemBoxVisuals: OverlayOcrItemBoxVisuals = activeSettingsPreset?.overlay?.visuals.ocr_item_box;
    const overlayFrameVisuals: OverlayFrameVisuals = activeSettingsPreset?.overlay?.visuals.frame;
    const overlayHotkeys: OverlayHotkeys = activeSettingsPreset?.overlay?.hotkeys;
    const overlayBehavior: OverlayBehavior = activeSettingsPreset?.overlay?.behavior;

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