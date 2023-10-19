import { Dictionary, DictionaryCreationInput } from "./dictionary";

describe("Dictionary tests", () => {

    it('should create a dictionary', () => {

        const input: DictionaryCreationInput = {
            name: 'JMdict (English)',
            order: 0,
            enabled: true
        };

        const dictionary = Dictionary.create( input );
            
        expect( dictionary.id ).toBeDefined();
        expect( dictionary.name ).toStrictEqual( input.name );
        expect( dictionary.order ).toStrictEqual( input.order );
        expect( dictionary.enabled ).toStrictEqual( input.enabled );
    });
});
