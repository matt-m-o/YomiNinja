import { Button } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { isElectronBrowser, isFullscreenWindow } from "../../utils/environment";

export default function OcrOverlayForBrowsers() {

    const { ocrResult } = useContext( OcrResultContext );

    const [ url, setUrl ] = useState<string>();
    const [ overlayWindow, setOverlayWindow ] = useState<Window>();
    const [ isPopup, setIsPopup ] = useState(false);
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

        setIsPopup( Boolean(window.opener) );
        
        setUrl( location.href.replace('-browser', '') );

    }, [] )

    useEffect( () => {

        if ( isPopup )
            setTitle( 'OCR Overlay - YomiNinja (Browser pop pup)' );
        else
            setTitle('OCR Overlay - YomiNinja')

    }, [isPopup] )

    function popOutOverlay() {

        const { widthOffset, heightOffset } = getWindowSizeOffset();

        const width = ocrResult?.context_resolution.width || 1200;
        const height = ocrResult?.context_resolution.height || 700;

        const top = ocrResult ? ocrResult.position.top - (heightOffset) : window.screenY;
        const left = ocrResult ? ocrResult.position.left - (widthOffset / 2) : window.screenX;

        const windowFeatures = `left=${left},top=${top},width=${width},height=${height},titlebar=no,location=0`;
        let overlayWindow = window.open(
            location.href,
            "mozillaWindow",
            windowFeatures
        );
        setOverlayWindow( overlayWindow );
    }

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

    // useEffect( () => {

    //     if ( !isPopup || !window ) return;

    //     window.addEventListener( 'resize', () => handleWindowResize(window) );

    //     return () => {
    //         window.removeEventListener( 'resize', () => handleWindowResize(window) );
    //     };
    // }, [isPopup] )


    function getWindowSizeOffset(): { widthOffset: number, heightOffset: number } {
        const widthOffset = window.outerWidth - window.innerWidth;
        const heightOffset = window.outerHeight - window.innerHeight;
        return {
            widthOffset,
            heightOffset
        };
    }


    useEffect( () => {
        
        if ( isPopup ) {
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
            window.resizeTo( newWidth, newHeight );
          }
    
          const newPosition = {
            x: position.left - (widthOffset / 2),
            y: position.top - heightOffset + 9
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
            window.moveTo( newPosition.x, newPosition.y );
          }
          window.blur();
        }
    }, [ocrResult] );
    

    return ( <div
        style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start'
        }}
    >
        <title>{title}</title>
        <iframe id='overlay-iframe' src={url} frameBorder="0"
            style={{
                aspectRatio: aspectRatio,
                height: "100vh",
            }}
        />
        
        <div
            style={{
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            { !isPopup &&
                <Button  variant='contained'
                    sx={{
                        minWidth: 100,
                        ml: 1,
                        mt: 1,
                        mr: 1
                    }}
                    onClick={popOutOverlay}
                >
                    Pop Out
                </Button>
            }

            <Button  variant='contained'
                sx={{
                    minWidth: 100,
                    ml: 1,
                    mt: 1,
                    mr: 1
                }}
                onClick={ () => {
                    const iframe = document.getElementById('overlay-iframe');
                    if (iframe.requestFullscreen) {
                        iframe.requestFullscreen();
                    // @ts-ignore
                    } else if (iframe.webkitRequestFullscreen) { /* Safari */
                        // @ts-ignore
                        iframe.webkitRequestFullscreen();
                    }
                }}
            >
                Fullscreen
            </Button>
        </div>
        
        
    </div>);
}