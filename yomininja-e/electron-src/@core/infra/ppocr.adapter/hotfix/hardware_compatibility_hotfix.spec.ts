import { cloneDeep } from 'lodash';
import { OcrEngineSettings } from '../../../domain/settings_preset/settings_preset';
import { applyCpuHotfix } from './hardware_compatibility_hotfix';
import { PpOcrEngineSettings, getPpOcrDefaultSettings, ppOcrAdapterName } from '../ppocr_settings';

describe( 'Hardware compatibility hotfix tests', () => {

    let ocrEngineSettings: PpOcrEngineSettings;
    

    beforeEach( () => {
        
        ocrEngineSettings = {
            ...getPpOcrDefaultSettings()
        };

    });

    it('should not apply CPU hotfix for intel CPUs', () => {
        
        const result = applyCpuHotfix( ocrEngineSettings, 'Core i5-14600K' );

        expect( result.ocrEngineSettings ).toStrictEqual( ocrEngineSettings );
    });

    it('should not apply CPU hotfix for AMD Ryzen 1000-5000 CPUs', () => {

        const models = [
            'AMD Ryzen 7 1800X',
            'AMD Ryzen 7 2700X',
            'AMD Ryzen 7 3800X',
            'AMD Ryzen 7 4700G',
            'AMD Ryzen 9 5800X',
        ];

        models.forEach( model => {        
            const result = applyCpuHotfix( ocrEngineSettings, model );
            expect( result.ocrEngineSettings ).toStrictEqual( ocrEngineSettings )            
        });        
    });


    it('should apply CPU hotfix for AMD Ryzen ^7000 CPUs', () => {

        const models = [
            'AMD Ryzen 7 9800X',
            'AMD Ryzen 7 7800X',
            'AMD Ryzen 7 10800X',
        ];

        models.forEach( model => {

            const result = applyCpuHotfix( cloneDeep(ocrEngineSettings), model );            

            expect( result.ocrEngineSettings.inference_runtime )
                .toStrictEqual( 'ONNX_CPU' );

            expect( result.restartEngine )
                .toStrictEqual( true );
        });        
    });
});