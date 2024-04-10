import { useContext, useEffect, useState } from 'react';
import { OcrResultContext, OcrResultProvider } from '../context/ocr_result.provider';
import FullscreenOcrResult from '../components/OcrOverlay/OcrResults';
import { SettingsContext, SettingsProvider } from '../context/settings.provider';
import OcrOverlay from '../components/OcrOverlay/OcrOverlay';
import { DictionaryProvider } from '../context/dictionary.provider';
import { OcrTemplatesProvider } from '../context/ocr_templates.provider';
import { NotificationsProvider } from '../context/notifications.provider';
import { TTSProvider } from '../context/text-to-speech.provider';



export default function OcrOverlayPage() {

 

  useEffect( () => {
    document.body.style.margin = "0px";
    document.body.style.padding = "0px";
    document.body.style.overflow = "hidden";
  }, []);
  

  return ( <>
    <title>OCR Overlay - YomiNinja</title>
    <SettingsProvider>
      <NotificationsProvider>
        <DictionaryProvider>
          <OcrResultProvider>
            <OcrTemplatesProvider>
              <TTSProvider>

                <OcrOverlay/>

              </TTSProvider>
            </OcrTemplatesProvider>
          </OcrResultProvider>
        </DictionaryProvider>
      </NotificationsProvider>
    </SettingsProvider>
  </> );
}
