import { OcrEngineSettings, SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetTypeOrmSchema } from "../../../infra/db/typeorm/settings_preset/settings_preset.schema";
import SettingsPresetTypeOrmRepository from "../../../infra/db/typeorm/settings_preset/settings_preset.typeorm.repository";
import { DataSource } from 'typeorm';
import { UpdateSettingsPresetUseCase, UpdateSettingsPreset_Input } from "./update_settings_preset.use_case";
import { FakeOcrEngineSettings, FakeOcrTestAdapter } from "../../../infra/test/fake_ocr.adapter/fake_ocr.adapter";
import { cloneDeep } from "lodash";
import { getDefaultSettingsPresetProps } from "../../../domain/settings_preset/default_settings_preset_props";
import { PpOcrEngineSettings, ppOcrAdapterName } from "../../../infra/ocr/ppocr.adapter/ppocr_settings";
import { SettingsPresetInstanceProps } from "../../../infra/types/entity_instance.types";



describe("UpdateSettingsPresetUseCase tests", () => {
    
    let defaultPreset: SettingsPreset;
        
    let updateSettingsPresetUseCase: UpdateSettingsPresetUseCase< PpOcrEngineSettings >;

    let settingsPresetRepo: SettingsPresetTypeOrmRepository;

    let ocrTestAdapter: FakeOcrTestAdapter;

    const defaultSettingsProps = getDefaultSettingsPresetProps();

    beforeEach( async () => {

        const dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [                
                SettingsPresetTypeOrmSchema,                
            ],
        });

        await dataSource.initialize();

        ocrTestAdapter = new FakeOcrTestAdapter();

        settingsPresetRepo = new SettingsPresetTypeOrmRepository(
            dataSource.getRepository( SettingsPreset )
        );
        updateSettingsPresetUseCase = new UpdateSettingsPresetUseCase(
            settingsPresetRepo,
            [ ocrTestAdapter ]
        );
            
        defaultPreset = SettingsPreset.create( defaultSettingsProps );
        defaultPreset.ocr_engines.push( ocrTestAdapter.getDefaultSettings() );
        await dataSource.getRepository( SettingsPreset ).insert( defaultPreset );
        
    });

    it("should update the default settings preset", async () => {        

        const input: UpdateSettingsPreset_Input = defaultPreset.toJson();

        input.name = 'custom 1';
        input.overlay.hotkeys.ocr = 'Ctrl+D';
        input.ocr_engines = [
            {
                ...ocrTestAdapter.getDefaultSettings(),
                image_scaling_factor: 0.5
            }
        ];

        const output = await updateSettingsPresetUseCase.execute( input );
        
        const foundPreset = await settingsPresetRepo.findOne({ id: defaultPreset.id });

        expect( foundPreset?.name ).toStrictEqual( input.name );
        expect( foundPreset?.overlay.hotkeys.ocr ).toStrictEqual( input.overlay.hotkeys.ocr );

        // console.log( foundPreset?.getOcrEngineSettings( FakeOcrTestAdapter._name ) )
        expect( foundPreset?.getOcrEngineSettings( FakeOcrTestAdapter._name )?.image_scaling_factor )
            .toStrictEqual( input.ocr_engines[0].image_scaling_factor );

        expect( output.restartOcrAdapter ).toBeFalsy();
    });
    
    it("should update the default settings preset and output.restartOcrAdapter must be truthy", async () => {        

        const input: UpdateSettingsPreset_Input = cloneDeep( defaultPreset.toJson() );

        const defaultPpOcrSettings = input.ocr_engines.find(
            item => item.ocr_adapter_name === FakeOcrTestAdapter._name
        );

        expect( defaultPpOcrSettings ).toBeDefined();

        if ( !defaultPpOcrSettings ) return;

        const ppOcrSettings: FakeOcrEngineSettings = {
            ...defaultPpOcrSettings as FakeOcrEngineSettings,
            cpu_threads: 1,
            max_image_width: 1280,
        };
       
        input.ocr_engines = input.ocr_engines.map( ocrSettings => {
            if ( ocrSettings.ocr_adapter_name !== FakeOcrTestAdapter._name )
                return ocrSettings;
            return ppOcrSettings;
        });

        const output = await updateSettingsPresetUseCase.execute( input );
        
        const foundPreset = await settingsPresetRepo.findOne({ id: defaultPreset.id });

        const getOcrEngineSettings = () => 
            foundPreset?.getOcrEngineSettings< FakeOcrEngineSettings >( FakeOcrTestAdapter._name );
        
        expect( getOcrEngineSettings()?.cpu_threads )
            .toStrictEqual( ppOcrSettings?.cpu_threads );

        expect( getOcrEngineSettings()?.max_image_width )
            .toStrictEqual( ppOcrSettings.max_image_width );

        expect( output.restartOcrAdapter ).toBeTruthy();
    });


    it("should update the default settings preset adding missing ocr settings", async () => {       
        
        defaultPreset.ocr_engines = [];
        await settingsPresetRepo.update(defaultPreset);

        const input: UpdateSettingsPreset_Input = defaultPreset.toJson();

        const output = await updateSettingsPresetUseCase.execute( input );
        
        const foundPreset = await settingsPresetRepo.findOne({ id: defaultPreset.id });

        expect( foundPreset?.ocr_engines ).toHaveLength( 1 );
      
    });
});