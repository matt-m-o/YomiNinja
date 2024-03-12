import { OcrItem, OcrResult } from "../../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { MangaOcrEngineSettings, getMangaOcrDefaultSettings, mangaOcrAdapterName } from "./manga_ocr_settings";
import { pyOcrService } from "../py_ocr_service/_temp_index";
import { mangaOcrPyService } from "./manga_ocr_py/_temp_index";

export class MangaOcrAdapter implements OcrAdapter< MangaOcrEngineSettings > {
    
    static _name: string = mangaOcrAdapterName;
    public readonly name: string = MangaOcrAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;
    private recognitionCallOnHold: OcrRecognitionInput | undefined;

    constructor() {}

    initialize() {

        pyOcrService.initialize();

        this.status = OcrAdapterStatus.Enabled;
    }

    async recognize( input: OcrRecognitionInput ): Promise< OcrResultScalable | null > {
        
        if ( this.status === OcrAdapterStatus.Processing ) {
            this.recognitionCallOnHold = input;
            console.log('holding recognition input');
            return null;
        }
        else {
            this.recognitionCallOnHold = undefined;            
        }
        
        this.idCounter++;
      
        console.log('processing recognition input');
        this.status = OcrAdapterStatus.Processing;
        // console.time('MangaOcrAdapter.recognize');
        const result = await mangaOcrPyService.recognize({
            id: this.idCounter.toString(),
            image: input.imageBuffer,
            boxes: [],
        });

        // console.timeEnd('PpOcrAdapter.recognize');
        this.status = OcrAdapterStatus.Enabled;
        
        // Throwing away current response an returning newest call result
        if ( this.recognitionCallOnHold ){
            return await this.recognize( this.recognitionCallOnHold );
        }

        if ( !result ) return null;

        return OcrResultScalable.createFromOcrResult(result);
    }

    async getSupportedLanguages(): Promise< string[] > {
        return ['ja'];
    }

    async updateSettings (
        settingsUpdate: MangaOcrEngineSettings,
        oldSettings?: MangaOcrEngineSettings | undefined
    ): Promise< UpdateOcrAdapterSettingsOutput <MangaOcrEngineSettings> > {
        return {
            settings: settingsUpdate,
            restart: false
        }
    }
    getDefaultSettings(): MangaOcrEngineSettings {
        return getMangaOcrDefaultSettings()
    }
    getSettingsOptions(): OcrEngineSettingsOptions{
        throw new Error('MangaOcrAdapter.getSettingsOptions() not implemented');
    }
    restart( callback: () => void ): void {
    }

}