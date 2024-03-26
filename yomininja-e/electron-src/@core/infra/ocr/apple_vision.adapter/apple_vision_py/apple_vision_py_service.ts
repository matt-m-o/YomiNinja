import { OcrResult } from "../../../../domain/ocr_result/ocr_result";
import { pyOcrService } from "../../py_ocr_service/_temp_index";
import { AppleVisionRecognize_Input, AppleVisionService } from "../apple_vision_service";


export class AppleVisionPyService implements AppleVisionService {

    async recognize( input: AppleVisionRecognize_Input ): Promise< OcrResult | null > {

        console.time("AppleVision Recognize");
        const result = await pyOcrService.recognize({
            id: input.id,
            image: input.image,
            languageCode: this.handleLanguageCode(input.languageCode),
            ocrEngine: 'AppleVision',
        });
        console.timeEnd("AppleVision Recognize");

        return result;
    };

    async getSupportedLanguages(): Promise<string[]> {
        return await pyOcrService.getSupportedLanguages( 'AppleVision' );
    }

    private handleLanguageCode( code: string ): string {

        if ( code === 'vi-VN' )
            return 'vi';

        return code;
    }
}