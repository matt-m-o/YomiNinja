import { useContext, useEffect, useState } from 'react';
import { OcrResult } from '../../electron-src/@core/domain/ocr_result/ocr_result';
import { styled } from '@mui/material/styles';
import { OcrResultContext, OcrResultProvider } from '../context/ocr_result.provider';
import FullscreenOcrResult from '../components/OcrOverlay/FullscreenOcrResult';
import { SettingsContext, SettingsProvider } from '../context/settings.provider';
import { OverlayFrameVisuals, OverlayOcrItemBoxVisuals } from '../../electron-src/@core/domain/settings_preset/settings_preset';
import OcrOverlay from '../components/OcrOverlay/OcrOverlay';



export default function OcrOverlayPage() {

 

  useEffect( () => {
    document.body.style.margin = "0px";
    document.body.style.padding = "0px";
    document.body.style.overflow = "hidden";
  }, []);
  

  return (
    <>      
      <title>OCR Overlay - YomiNinja</title>

      <SettingsProvider>
        <OcrResultProvider>

          <OcrOverlay/>          

        </OcrResultProvider>
      </SettingsProvider>
    </>
    
  );
}
