import { SettingsPreset } from "../../../domain/settings_preset/settings_preset"
import SettingsPresetInMemoryRepository from "./settings_preset.in_memory.repository"


describe( "SettingsPresetInMemoryRepository tests", () => {

    let repo: SettingsPresetInMemoryRepository;

    beforeEach( () => {
        
        repo = new SettingsPresetInMemoryRepository();
    });

    it("should insert a new settings preset", async () => {

        const settingsPreset = SettingsPreset.create();

        await repo.insert(settingsPreset);
        expect( repo.items.get( settingsPreset.id ) ).toStrictEqual( settingsPreset );

        // Testing for object references
        settingsPreset.language_code = 'ch';
        expect( repo.items.get( settingsPreset.id ) ).not.toEqual( settingsPreset );
    });
    

    it("should find one settings preset", async () => {

        const defaultPreset = SettingsPreset.create();
        const customPreset = SettingsPreset.create({ name: 'custom' });

        repo.items.set( defaultPreset.name, defaultPreset );
        repo.items.set( customPreset.name, customPreset );

        const foundPreset = await repo.findOne({ name: customPreset.name });

        expect( foundPreset ).toStrictEqual( customPreset );
        
    });

    it("should delete one settings preset", async () => {

        const defaultPreset = SettingsPreset.create();
        const customPreset = SettingsPreset.create({ name: 'custom' });

        repo.items.set( defaultPreset.id, defaultPreset );
        repo.items.set( customPreset.id, customPreset );

        await repo.delete( defaultPreset.id );

        expect( repo.items.get( customPreset.id ) ).toStrictEqual( customPreset );
        expect( repo.items.get( defaultPreset.id ) ).toBeUndefined();
    });
})