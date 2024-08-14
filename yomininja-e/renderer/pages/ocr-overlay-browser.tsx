import { OcrResultProvider } from '../context/ocr_result.provider';
import OcrOverlayForBrowsers from '../components/OcrOverlay/OcrOverlayForBrowsers';
import { AppInstallationProvider } from '../context/app_installation.provider';

export default function OcrOverlayBrowserPage() {

    return (
        <AppInstallationProvider>
            <OcrResultProvider>
                <OcrOverlayForBrowsers/>
            </OcrResultProvider>
        </AppInstallationProvider>
    );
}