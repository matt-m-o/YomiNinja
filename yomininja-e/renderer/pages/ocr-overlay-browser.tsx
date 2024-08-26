import { OcrResultProvider } from '../context/ocr_result.provider';
// import OcrOverlayForBrowsers from '../components/OcrOverlay/OcrOverlayForBrowsers';
import { AppInstallationProvider } from '../context/app_installation.provider';
import { SettingsProvider } from '../context/settings.provider';
import OcrOverlayForBrowsersAlt from '../components/OcrOverlay/OcrOverlayForBrowsersAlt';
import { useEffect, useState } from 'react';
import { getCookie, setCookie, hasCookie, deleteCookie } from 'cookies-next';
import OcrOverlayForBrowsers from '../components/OcrOverlay/OcrOverlayForBrowsers';

export default function OcrOverlayBrowserPage() {

    const [ strictMode, setStrictMode ] = useState(true);

    useEffect( () => {

        setTimeout( () => {
            const usingMigaku = Boolean(
                document.getElementById('MigakuShadowDom')
            );

            if ( !hasCookie( 'strict_mode' ) ) {
                setCookie( 'strict_mode', (!usingMigaku).toString() );
                location.reload();
            }
            else {
                setStrictMode( Boolean( getCookie('strict_mode') == 'true' ) );
            }
            
        }, 1000 );

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