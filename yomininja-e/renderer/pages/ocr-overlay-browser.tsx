import { OcrResultProvider } from '../context/ocr_result.provider';
// import OcrOverlayForBrowsers from '../components/OcrOverlay/OcrOverlayForBrowsers';
import { AppInstallationProvider } from '../context/app_installation.provider';
import { SettingsProvider } from '../context/settings.provider';
import OcrOverlayForBrowsersAlt from '../components/OcrOverlay/OcrOverlayForBrowsersAlt';
import { useEffect, useState } from 'react';
import { getCookie, setCookie, hasCookie } from 'cookies-next';
import OcrOverlayForBrowsers from '../components/OcrOverlay/OcrOverlayForBrowsers';

export default function OcrOverlayBrowserPage() {

    const [ strictMode, setStrictMode ] = useState(true);

    useEffect( () => {

        if ( !hasCookie( 'strict_mode' ) )
            setCookie( 'strict_mode', 'true' );

        setStrictMode( Boolean( getCookie('strict_mode') == 'true' ) );

    }, [] );

    return (
        <SettingsProvider>
            <AppInstallationProvider>
                <OcrResultProvider>
                    { strictMode &&
                        <OcrOverlayForBrowsers/>
                    }
                    { !strictMode &&
                        <OcrOverlayForBrowsersAlt/>
                    }
                </OcrResultProvider>
            </AppInstallationProvider>
        </SettingsProvider>
    );
}