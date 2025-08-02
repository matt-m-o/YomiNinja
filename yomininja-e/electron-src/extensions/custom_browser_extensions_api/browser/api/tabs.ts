import { ocrRecognitionController } from "../../../../ocr_recognition/ocr_recognition.index";
import { bufferToDataURL } from "../../../../util/image.util";
import { ResponseData } from "./browser_api";

export class TabsAPI {

    captureVisibleTab = async ( data: any ): Promise< ResponseData > => {

        let options: chrome.tabs.CaptureVisibleTabOptions = {};

        if ( 'options' in data )
            options = data['options'];

        const jsonData: ResponseData = { data: '' };

        const { format, quality } = options;

        const image = ocrRecognitionController.resultImage();

        if ( !image )
            return jsonData;

        let imageDataUrl = '';

        try {
            imageDataUrl = await bufferToDataURL({
                image,
                format: format || 'png',
                quality 
            });
        } catch (error) {
            console.error(error);
        }

        return {
            data: imageDataUrl
        };
    }
};