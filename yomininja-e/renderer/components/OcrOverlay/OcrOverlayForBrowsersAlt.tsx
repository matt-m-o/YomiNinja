import { Button, FormControlLabel, Switch } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { OcrResultContext, OcrResultProvider } from "../../context/ocr_result.provider";
import { getWindowSizeOffset, isElectronBrowser, isFullscreenWindow, isInPWAMode, onDisplayModeChange } from "../../utils/environment";
import Head from 'next/head';
import { AppInstallationContext } from "../../context/app_installation.provider";
import { SettingsContext, SettingsProvider } from "../../context/settings.provider";
import { NotificationsProvider } from "../../context/notifications.provider";
import { DictionaryProvider } from "../../context/dictionary.provider";
import { OcrTemplatesProvider } from "../../context/ocr_templates.provider";
import { TTSProvider } from "../../context/text-to-speech.provider";
import { ProfileProvider } from "../../context/profile.provider";
import OcrOverlay from "./OcrOverlay";
import { getCookie, setCookie, hasCookie } from 'cookies-next';
import OcrOverlayMenu from "./OcrOverlayMenu";

export default function OcrOverlayForBrowsersAlt() {

    const { ocrResult } = useContext( OcrResultContext );
    
    const { activeSettingsPreset } = useContext( SettingsContext );

    const automaticAdjustment = typeof activeSettingsPreset?.overlay?.behavior?.automatic_adjustment  === 'boolean'?
        activeSettingsPreset?.overlay?.behavior?.automatic_adjustment :
        true;

    const [ overlayWindow, setOverlayWindow ] = useState<Window>();
    const [ isPopup, setIsPopup ] = useState(false);
    const [ isPWA, setIsPWA ] = useState(false);
    const [ title, setTitle ] = useState('');

    const ocrResultResolution = ocrResult?.context_resolution;

    let aspectRatio = ocrResult ?
        ocrResultResolution.width / ocrResultResolution.height :
        16 / 9;

    const isElectron = isElectronBrowser();

    useEffect( () => {

        document.body.style.margin = "0px";
        document.body.style.padding = "0px";
        document.body.style.overflow = "hidden";

        if ( typeof location === 'undefined') return;

        setIsPopup(
            Boolean(window.opener) ||
            isInPWAMode( window )
        );

        setIsPWA( isInPWAMode( window ) );

        const off = onDisplayModeChange( window, ( mode ) => {
            console.log({ mode })
            const isPwa = isInPWAMode( window );
            setIsPWA( isInPWAMode( window ) );
        });

        return () => {
            off();
        }
    }, [] )

    useEffect( () => {

        if ( isPopup || isPWA )
            setTitle( 'OCR Overlay - YomiNinja (Browser pop pup)' );
        else
            setTitle('OCR Overlay - YomiNinja')

    }, [ isPopup, isPWA ] )

    let ignoreResizeEvent = false;
    let resizeTimeout = null;

    const handleWindowResize = ( window: Window ) => {

        if ( !aspectRatio ) return;

        if (
            isFullscreenWindow( overlayWindow )
        )
            return;

        if ( ignoreResizeEvent ) {
            ignoreResizeEvent = false;
            return;
        }

        if ( resizeTimeout ) clearTimeout( resizeTimeout );

        resizeTimeout = setTimeout( () => {

            const { widthOffset, heightOffset } = getWindowSizeOffset();

            const newWidth = window.innerWidth;
            ignoreResizeEvent = true;
            const newHeight = (newWidth / aspectRatio) + heightOffset;
            console.log({ aspectRatio })
            window.resizeTo( newWidth, newHeight );
        }, 500 );
    }

    function onWindowClose() {
        setOverlayWindow(undefined);
    }

    useEffect( () => {

        if ( !overlayWindow ) return;
        
        overlayWindow.addEventListener( 'close', onWindowClose );

        return () => {
            document.removeEventListener( 'close', onWindowClose );
        };
    }, [overlayWindow] );

    useEffect( () => {

        const migakuWorkaround = () =>  {
            document.querySelectorAll('.ocr-line').forEach( el => {
                (el as HTMLElement).style.whiteSpace = 'normal';
            });
        }

        const observer = new MutationObserver( () => {
            const migakuEl = document.querySelector('.migaku-sentence');
            if ( migakuEl ) {
                const line = document.querySelector('.ocr-line') as HTMLElement;
                if ( !line || line.style.whiteSpace == 'normal' ) return;
                migakuWorkaround();
                setTimeout(migakuWorkaround, 5000);
                // observer.disconnect();
            }
        });
      
        observer.observe( document.body, {
            childList: true,
            subtree: true,
        });
    
        return () => observer.disconnect(); // Cleanup on unmount
        
    }, []);

    // useEffect( () => {

    //     if ( !isPopup || !window ) return;

    //     window.addEventListener( 'resize', () => handleWindowResize(window) );

    //     return () => {
    //         window.removeEventListener( 'resize', () => handleWindowResize(window) );
    //     };
    // }, [isPopup] )


    


    useEffect( () => {
        
        if ( (isPopup || isPWA) && ocrResult ) {
          const { context_resolution, position } = ocrResult;
          const { widthOffset, heightOffset } = getWindowSizeOffset();
    
          const newWidth = context_resolution.width + widthOffset;
          const newHeight = context_resolution.height + heightOffset;
    
          const isFullScreen = isFullscreenWindow( window );
    
          if ( !isFullScreen && (newWidth != window.innerWidth || newHeight != window.innerHeight) ) {
            console.log("Resizing window!");
            // console.log({
            //   newWidth,
            //   newHeight
            // });
            ignoreResizeEvent = true;

            if ( automaticAdjustment )
                window.resizeTo( newWidth, newHeight );
          }
    
          const newPosition = {
            x: Number(position?.left) - (widthOffset / 2),
            y: Number(position?.top) - heightOffset + 9
          };
    
          
          if ( newPosition.x != window.screenLeft || newPosition.y - 9 != window.screenTop  ) {
            console.log("Moving window!");
            // console.log({
            //   newPosition,
            //   currentPosition: {
            //     screenLeft: window.screenLeft,
            //     screenTop: window.screenTop
            //   }
            // });
            if ( isFullscreenWindow(window) ) return;

            if ( automaticAdjustment )
                window.moveTo( newPosition.x, newPosition.y ); 
          }
        }
    }, [ocrResult] );
    

    return ( <div
        style={{
            display: 'flex',
            backgroundColor: 'black',
            flexDirection: 'row',
            alignItems: 'flex-start',
            scrollbarColor: 'transparent'
        }}
    >
        <Head>
            <title>{title}</title>
        </Head>

        <div id='container'
            style={{
                width: "100vw",
                height: '100vh',
                minWidth: ocrResultResolution?.width
            }}
        >
            <div id='overlay-container'
                style={{
                    width: ocrResultResolution?.width,
                    height: ocrResultResolution?.height || '100%',
                    // maxHeight: '105%',
                    maxWidth: '105%',
                    aspectRatio,
                }}
            >
                <NotificationsProvider>
                    <DictionaryProvider>
                        <OcrTemplatesProvider>
                            <TTSProvider>
                                <ProfileProvider>

                                    <OcrOverlay/>

                                </ProfileProvider>
                            </TTSProvider>
                        </OcrTemplatesProvider>
                    </DictionaryProvider>
                </NotificationsProvider>
            </div>
        </div>
        
        <OcrOverlayMenu/>
        
        
    </div>);
}