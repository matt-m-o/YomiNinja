import { SettingsPreset } from "../../../domain/settings_preset/settings_preset";
import { SettingsPresetTypeOrmSchema } from "../../../infra/db/typeorm/settings_preset/settings_preset.schema";
import SettingsPresetTypeOrmRepository from "../../../infra/db/typeorm/settings_preset/settings_preset.typeorm.repository";
import { DataSource } from 'typeorm';
import { UpdateSettingsPresetUseCase, UpdateSettingsPreset_Input } from "./update_settings_preset.use_case";

describe("UpdateSettingsPresetUseCase tests", () => {
    
    let defaultPreset: SettingsPreset;
        
    let updateSettingsPresetUseCase: UpdateSettingsPresetUseCase;

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
        updateSettingsPresetUseCase = new UpdateSettingsPresetUseCase(
            settingsPresetRepo
        );
            
        defaultPreset = SettingsPreset.create();
        await dataSource.getRepository( SettingsPreset ).insert( defaultPreset );
        
    });

    it("should update the default settings preset", async () => {        

        const input: UpdateSettingsPreset_Input = defaultPreset.toJson();

        input.name = 'custom 1';
        input.overlay.hotkeys.ocr = 'Ctrl+D';
        input.ocr_engine.image_scaling_factor = 0.5;

        await updateSettingsPresetUseCase.execute( input );
        
        const foundPreset = await settingsPresetRepo.findOne({ id: defaultPreset.id });

        expect( foundPreset?.name ).toStrictEqual( input.name );
        expect( foundPreset?.overlay.hotkeys.ocr ).toStrictEqual( input.overlay.hotkeys.ocr );
        expect( foundPreset?.ocr_engine.image_scaling_factor )
            .toStrictEqual( input.ocr_engine.image_scaling_factor );
    });
    
});