import { OcrResultProvider } from '../context/ocr_result.provider';
import OcrOverlayForBrowsers from '../components/OcrOverlay/OcrOverlayForBrowsers';

export default function OcrOverlayBrowserPage() {

    return (
        <OcrResultProvider>
            <OcrOverlayForBrowsers/>
        </OcrResultProvider>
    );
}