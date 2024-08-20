import { OcrResult } from "../../../../domain/ocr_result/ocr_result";
import { pyOcrService } from "../../ocr_services/py_ocr_service/_temp_index";
import { AppleVisionRecognize_Input, AppleVisionService } from "../apple_vision_service";
import os from 'os';
import semver from 'semver';

export class AppleVisionPyService implements AppleVisionService {

    private ocrEngine: string = 'AppleVisionKit';

    constructor() {

        if ( !semver.valid( os.release() ) )
            return;

        this.ocrEngine = semver.gt( os.release(), '22.0.0' ) ?
            'AppleVisionKit':
            'AppleVision';
    }

    async recognize( input: AppleVisionRecognize_Input ): Promise< OcrResult | null > {

        console.time(`${this.ocrEngine} Recognize`);
        const result = await pyOcrService.recognize({
            id: input.id,
            image: input.image,
            languageCode: this.handleLanguageCode(input.languageCode),
            ocrEngine: this.ocrEngine
        });
        console.time(`${this.ocrEngine} Recognize`);

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