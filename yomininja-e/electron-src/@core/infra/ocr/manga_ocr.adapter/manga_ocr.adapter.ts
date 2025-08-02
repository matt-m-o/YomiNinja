import { OcrItem, OcrResult } from "../../../domain/ocr_result/ocr_result";
import { HardwareAccelerationOption, OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, RecognizeSelectionInput, TextRecognitionModel, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { OcrResultScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import { MangaOcrEngineSettings, getMangaOcrDefaultSettings, mangaOcrAdapterName } from "./manga_ocr_settings";
import { pyOcrService } from "../ocr_services/py_ocr_service/_temp_index";
import { mangaOcrPyService } from "./manga_ocr_py/_temp_index";
import { sleep } from "../../../../util/sleep.util";

export class MangaOcrAdapter implements OcrAdapter< MangaOcrEngineSettings > {
    
    static _name: string = mangaOcrAdapterName;
    public readonly name: string = MangaOcrAdapter._name;
    // public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;
    private recognitionCallOnHold: OcrRecognitionInput | undefined;

    private prevImage: Buffer = Buffer.from('');
    private prevResult: OcrResultScalable | null = null;
    private prevResultTime: Date = new Date();

    private engineSettings: MangaOcrEngineSettings;

    get status(): OcrAdapterStatus {
        return mangaOcrPyService.status;
    }

    constructor() {}

    initialize() {
        // this.status = OcrAdapterStatus.Enabled;
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
        // this.status = OcrAdapterStatus.Processing;
        // console.time('MangaOcrAdapter.recognize');

        const detection_only = Boolean(
            input.detectionOnly ||
            this.engineSettings.use_selective_recognition
        );

        let result: OcrResult | null = null;
        try {
            result = await mangaOcrPyService.recognize({
                id: this.idCounter.toString() + this.name,
                image: input.imageBuffer,
                text_detector: this.engineSettings.text_detector,
                detection_only
            });
            
        } catch (error) {
            console.error( error );
            // this.status = OcrAdapterStatus.Enabled
        }

        // console.timeEnd('PpOcrAdapter.recognize');
        // this.status = OcrAdapterStatus.Enabled;
        
        // Throwing away current response an returning latest call result
        if ( this.recognitionCallOnHold ){
            return await this.recognize( this.recognitionCallOnHold );
        }

        if ( !result ) {
            this.cacheResult(null);
            return null
        };

        const resultScalable = OcrResultScalable.createFromOcrResult(result);
        resultScalable.ocr_engine_name = this.name;
        resultScalable.language = input.language;
        this.cacheResult( resultScalable );

        return this.postProcess(resultScalable);
    }

    async recognizeSelection( input: RecognizeSelectionInput ): Promise< OcrResultScalable | null > {

        if ( this.status === OcrAdapterStatus.Processing )
            return input.partialOcrResult;

        const { partialOcrResult, selectedItemIds } = input;
      
        // console.log('processing recognition selective input');
        // this.status = OcrAdapterStatus.Processing;
        // console.time('MangaOcrAdapter.recognize');

        let result: OcrResult | null = null;
        try {
            result = await mangaOcrPyService.recognizeSelective({
                id: input.resultId || partialOcrResult.id,
                selectedItemIds
            });
        } catch (error) {
            console.error( error );
            // this.status = OcrAdapterStatus.Enabled
        }

        // console.log("MangaOcrAdapter result:")
        // console.log(result);
        // result?.results.forEach(console.log);

        // console.timeEnd('PpOcrAdapter.recognize');
        // this.status = OcrAdapterStatus.Enabled;

        if ( !result ) {
            this.cacheResult(null);
            return null
        };

        const resultScalable = OcrResultScalable.createFromOcrResult(result);
        resultScalable.ocr_engine_name = this.name;
        resultScalable.language = input.language || partialOcrResult.language;
        this.cacheResult( resultScalable );

        return this.postProcess( resultScalable );
    }

    private postProcess( data: OcrResultScalable ): OcrResultScalable {
        data.ocr_regions.forEach( region => {
            region.results.forEach( result => {
                result.text.forEach(
                    line => { 
                        line.content = line.content?.replaceAll( '．．．', '…' ) || '';
                    }
                )
            });
        });

        return data;
    }

    async getSupportedLanguages(): Promise< string[] > {
        return ['ja-JP'];
    }

    async getSupportedModels(): Promise< TextRecognitionModel[] > {
        const models = await mangaOcrPyService.getSupportedModels();

        return models.map( m => {
            return {
                name: m.name || '',
                languageCodes: m.language_codes || [],
                isInstalled: m.is_installed || false,
            }
        });

    }

    async installModel( modelName: string ): Promise< boolean > {
        return await mangaOcrPyService.installModel( modelName );
    }

    async getHardwareAccelerationOptions(): Promise< HardwareAccelerationOption[] > {
        return await mangaOcrPyService.getHardwareAccelerationOptions();
    }

    async installHardwareAcceleration( option: HardwareAccelerationOption ): Promise< boolean > {
        return await mangaOcrPyService.installHardwareAcceleration( option );
    }

    async updateSettings (
        settingsUpdate: MangaOcrEngineSettings,
        oldSettings?: MangaOcrEngineSettings | undefined
    ): Promise< UpdateOcrAdapterSettingsOutput <MangaOcrEngineSettings> > {

        this.engineSettings = settingsUpdate;

        this.resetCache();

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
        console.warn("Warning! 'MangaOcrAdapter.restart' is not implemented!")
        callback();
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

        if ( !this.prevImage?.equals ) return false;

        const isSameImage = this.prevImage.equals( image );

        if ( !isSameImage ) return false;

        return true;
    }

    private resetCache() {
        this.prevImage = Buffer.from('');
    }
}