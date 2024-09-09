import { Button, FormControlLabel, Switch } from "@mui/material";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { AppInstallationContext } from "../../context/app_installation.provider";
import { getWindowSizeOffset, isFullscreenWindow, isInPWAMode, onDisplayModeChange } from "../../utils/environment";
import { OcrResultContext } from "../../context/ocr_result.provider";
import { getCookie, setCookie, hasCookie } from 'cookies-next';
import CloseIcon from '@mui/icons-material/Close';


export default function OcrOverlayMenu() {

    const [ visible, setVisible ] = useState(true);
    const { ocrResult } = useContext( OcrResultContext );
    const { installButtonVisibility, install } = useContext( AppInstallationContext );
    const [ strictMode, setStrictMode ] = useState(true);
    const [ isPopup, setIsPopup ] = useState(false);
    const [ isPWA, setIsPWA ] = useState(false);
    const [ isFullscreen, setIsFullscreen ] = useState(false);
    const [ homeUrl, setHomeUrl ] = useState('');
    const [ url, setUrl ] = useState<string>();

    useEffect( () => {
        
        if ( typeof location === 'undefined') return;

        setStrictMode( Boolean( getCookie('strict_mode') == 'true' ) );

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

        setIsFullscreen( isFullscreenWindow( window ) )
        setUrl( location.href.replace('-browser', '') );
        setHomeUrl(
            location.href.replace( '/ocr-overlay-browser', '' )
            .replace('.html', '' )
        );

        return () => {
            off();
        }
    }, [] );
    
    
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
        // setOverlayWindow( overlayWindow );
    }

    
    return (
        <div
            style={{
                display: visible ? 'flex' : 'none',
                flexDirection: 'column',
                backgroundColor: '#272727',
                position: 'absolute',
                top: '70px',
                right: '1%',
                borderRadius: '14px',
                paddingBottom: '5px'
            }}
        >
            <Button
                id='close-overlay-menu'
                endIcon={<CloseIcon/>}
                onClick={ () => {
                    setVisible(false)
                }}
            >
                Close Menu
            </Button>
            <Button
                title="Install this WebApp for an enhanced overlay!"
                variant='contained'
                sx={{
                    display: installButtonVisibility ? 'inherit' : 'none',
                    minWidth: 100,
                    ml: 1,
                    mt: 1,
                    mr: 1
                }}
                onClick={install}
            >
                Install
            </Button>
            { !isPopup && !isPWA && !isFullscreen &&
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

            <Button variant='contained'
                sx={{
                    minWidth: 100,
                    ml: 1,
                    mt: 1,
                    mr: 1
                }}
                onClick={ () => {


                    const body = document.body;

                    body.addEventListener( 'fullscreenchange', () => {
                        setIsFullscreen( Boolean(document.fullscreenElement) )
                    });

                    if ( isFullscreen ) {
                        if ( document.exitFullscreen ) {
                            document.exitFullscreen();
                        }
                        // @ts-ignore
                        else if ( document.webkitExitFullscreen ) {// Safari
                            // @ts-ignore
                            document.webkitExitFullscreen();
                        }
                    }
                    else if ( body.requestFullscreen ) {
                        body.requestFullscreen();
                    // @ts-ignore
                    } else if ( body.webkitRequestFullscreen ) { // Safari
                        // @ts-ignore
                        body.webkitRequestFullscreen();
                    }
                }}
            >
                Fullscreen
            </Button>

            <Button
                variant='contained'
                href={homeUrl}
                sx={{
                    minWidth: 100,
                    ml: 1,
                    mt: 1,
                    mr: 1
                }}
            >
                Home
            </Button>

            <FormControlLabel label='Strict Mode'
                title="Strict Mode can break some extensions"
                control={
                    <Switch
                        checked={ strictMode }
                        onChange={ ( event ) => {
                            setCookie(
                                'strict_mode',
                                event.target.checked.toString()
                            );
                            setStrictMode( event.target.checked )
                            location.reload()
                        }}
                    /> 
                }
                sx={{
                    color: 'white',
                    minWidth: 145,
                    ml: 0,
                    mt: 1,
                    mr: 1  
                }}
            />

        </div>
    );
}