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

    private prevImage: Buffer = Buffer.from('');
    private prevResult: OcrResultScalable | null = null;
    private prevResultTime: Date = new Date();

    constructor() {}

    initialize() {

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

        const isCacheValid = this.isCacheValid( input.imageBuffer );
        // console.log({ [`${this.name}_IsCacheValid`]: isCacheValid });
        if ( isCacheValid )
            return this.prevResult;
        else
            this.prevImage = input.imageBuffer;
      
        console.log('processing recognition input');
        this.status = OcrAdapterStatus.Processing;
        // console.time('MangaOcrAdapter.recognize');

        let result: OcrResult | null = null;
        try {
            result = await mangaOcrPyService.recognize({
                id: this.idCounter.toString() + this.name,
                image: input.imageBuffer,
                boxes: [],
            });
            
        } catch (error) {
            console.error( error );
            this.status = OcrAdapterStatus.Enabled
        }

        // console.timeEnd('PpOcrAdapter.recognize');
        this.status = OcrAdapterStatus.Enabled;
        
        // Throwing away current response an returning latest call result
        if ( this.recognitionCallOnHold ){
            return await this.recognize( this.recognitionCallOnHold );
        }

        if ( !result ) {
            this.cacheResult(null);
            return null
        };

        const resultScalable = OcrResultScalable.createFromOcrResult(result);
        this.cacheResult( resultScalable );

        return resultScalable;
    }

    async getSupportedLanguages(): Promise< string[] > {
        return ['ja-JP'];
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

    private cacheResult( result: OcrResultScalable | null ) {
        this.prevResult = result;
        this.prevResultTime = new Date();
    }

    private getCacheAge(): number { // seconds
        return ( Date.now() - this.prevResultTime.getTime() ) / 1000;
    }

    private isCacheValid( image: Buffer ): boolean {

        if ( this.getCacheAge() > 30 )
            return false;

        const isSameImage = this.prevImage.equals( image );

        if ( !isSameImage ) return false;

        return true;
    }
}