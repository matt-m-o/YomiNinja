import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetTypeOrmSchema } from "../../../infra/db/typeorm/settings_preset/settings_preset.schema";
import SettingsPresetTypeOrmRepository from "../../../infra/db/typeorm/settings_preset/settings_preset.typeorm.repository";
import { DataSource } from 'typeorm';

import { FakeOcrTestAdapter } from "../../../infra/test/fake_ocr.adapter/fake_ocr.adapter";
import { CreateSettingsPresetUseCase, CreateSettingsPreset_Input } from "./create_settings_preset.use_case";

describe("CreateSettingsPresetUseCase tests", () => {    
        
    let useCase: CreateSettingsPresetUseCase;

    let settingsPresetRepo: SettingsPresetTypeOrmRepository;


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

        settingsPresetRepo = new SettingsPresetTypeOrmRepository(
            dataSource.getRepository( SettingsPreset )
        );
        useCase = new CreateSettingsPresetUseCase({
            settingsPresetRepo,
            ocrAdapter: new FakeOcrTestAdapter()
        });
        
    });

    it("should create the default settings preset", async () => {        

        await useCase.execute();
        
        const foundPreset = await settingsPresetRepo.findOne({
            name: SettingsPreset.default_name
        });

        expect( foundPreset?.name ).toStrictEqual( SettingsPreset.default_name );
        expect( foundPreset?.ocr_engine.inference_runtime )
            .toStrictEqual( 'ONNX_CPU' );
    });
    
    it("should create a custom settings preset", async () => {        

        const input: CreateSettingsPreset_Input = {
            name: 'Custom',
            ocr_engine: {
                cpu_threads: 32,
                image_scaling_factor: 1,
                max_image_width: 1920,
                inference_runtime: 'Open_VINO',
                invert_colors: false,
                ocr_adapter_name: FakeOcrTestAdapter._name
            }
        };

        await useCase.execute( input );
        
        const foundPreset = await settingsPresetRepo.findOne({ name: input.name });

        expect( foundPreset?.ocr_engine )
            .toStrictEqual( input.ocr_engine );
    });
});