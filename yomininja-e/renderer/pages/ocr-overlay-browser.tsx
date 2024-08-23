import { OcrResultProvider } from '../context/ocr_result.provider';
import OcrOverlayForBrowsers from '../components/OcrOverlay/OcrOverlayForBrowsers';
import { AppInstallationProvider } from '../context/app_installation.provider';
import { SettingsProvider } from '../context/settings.provider';

export default function OcrOverlayBrowserPage() {

    return (
        <SettingsProvider>
            <AppInstallationProvider>
                <OcrResultProvider>
                    <OcrOverlayForBrowsers/>
                </OcrResultProvider>
            </AppInstallationProvider>
        </SettingsProvider>
    );
}