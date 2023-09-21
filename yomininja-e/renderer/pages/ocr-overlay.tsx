import { useContext, useEffect, useState } from 'react';
import { OcrResult } from '../../electron-src/@core/domain/ocr_result/ocr_result';
import { styled } from '@mui/material/styles';
import { OcrResultContext, OcrResultProvider } from '../context/ocr_result.provider';
import FullscreenOcrResult from '../components/fullscreen_ocr_result';


const OverlayFrame = styled('div')({
  border: 'solid 1px red',
  height: '99.8vh',
  overflow: 'hidden',
});



export default function OcrOverlayPage() {
  

  useEffect( () => {
    document.body.style.margin = "0px";
    document.body.style.padding = "0px";
    document.body.style.overflow = "hidden";
  }, []);
  

  return (
    <OcrResultProvider>
      <OverlayFrame>

        <FullscreenOcrResult />

      </OverlayFrame>
    </OcrResultProvider>
  );
}
