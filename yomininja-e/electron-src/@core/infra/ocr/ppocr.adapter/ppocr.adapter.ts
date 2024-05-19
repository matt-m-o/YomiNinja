import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { RecognizeBytesRequest } from "../../../../../grpc/rpc/ocr_service/RecognizeBytesRequest";

import { PpOcrEngineSettings, getPpOcrDefaultSettings, ppOcrAdapterName } from "./ppocr_settings";
import { UpdatePpOcrSettingsRequest } from "../../../../../grpc/rpc/ocr_service/UpdatePpOcrSettingsRequest";
import { OcrEngineSettingsU } from "../../types/entity_instance.types";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { paddleOcrService } from "../ocr_services/paddle_ocr_service/_temp_index";

export class PpOcrAdapter implements OcrAdapter< PpOcrEngineSettings > {
    
    static _name: string = ppOcrAdapterName;
    public readonly name: string = PpOcrAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;
    private recognitionCallOnHold: OcrRecognitionInput | undefined;


    async recognize( input: OcrRecognitionInput ): Promise< OcrResultScalable | null > {
        
        if ( this.status === OcrAdapterStatus.Processing ) {
            this.recognitionCallOnHold = input;
            console.log('holding recognition input (PaddleOcrAdapter)');
            return null;
        }
        else {
            this.recognitionCallOnHold = undefined;            
        }

        this.idCounter++;

        const { language } = input

        let language_code = language.bcp47_tag || language.two_letter_code;

        if ( language.two_letter_code === 'en' )
            language_code = 'en';
        
        const requestInput: RecognizeBytesRequest = {
            id: this.idCounter.toString()+this.name,
            image_bytes: input.imageBuffer,
            language_code
        };

        console.log('processing recognition input (PaddleOcrAdapter)');
        this.status = OcrAdapterStatus.Processing;
        const result = await paddleOcrService.recognize( requestInput )
        this.status = OcrAdapterStatus.Enabled;
        
        // Throwing away current response an returning newest call result
        if ( this.recognitionCallOnHold ){
            return await this.recognize( this.recognitionCallOnHold );
        }

        if ( !result )
            return null;

        return OcrResultScalable.createFromOcrResult( result )
    }

    async getSupportedLanguages(): Promise< string[] > {
        return await paddleOcrService.getSupportedLanguages();
    }


    async updateSettings(
        _settingsUpdate: OcrEngineSettingsU,
        _oldSettings?: OcrEngineSettingsU
    ): Promise< UpdateOcrAdapterSettingsOutput< PpOcrEngineSettings > > {

        return await paddleOcrService.updateSettings(
            _settingsUpdate,
            _oldSettings
        );
    }

    getDefaultSettings(): PpOcrEngineSettings {
        return getPpOcrDefaultSettings();
    }

    getSettingsOptions(): OcrEngineSettingsOptions {
        return {
            inference_runtime: [
                {
                    value: 'Open_VINO',
                    displayName: 'OpenVINO CPU (fastest)'
                },
                {
                    value: 'ONNX_CPU',
                    displayName: 'ONNX CPU'
                }
            ]
        }
    }

    async restart( callback: () => void ): Promise< void > {
        await paddleOcrService.restart( callback );
    };

}