import { Dictionary, DictionaryCreationInput } from "./dictionary";

describe("Dictionary tests", () => {

    it('should create a dictionary', () => {

        const input: DictionaryCreationInput = {
            name: 'JMdict (English)',
            version: 'jmdict4',
            order: 0,
            enabled: true,
            source_language: 'ja',
            target_language: 'en',
        };

        const dictionary = Dictionary.create( input );
            
        expect( dictionary.id ).not.toBeDefined();
        expect( dictionary.name ).toStrictEqual( input.name );
        expect( dictionary.version ).toStrictEqual( input.version );
        expect( dictionary.order ).toStrictEqual( input.order );
        expect( dictionary.enabled ).toStrictEqual( input.enabled );
        expect( dictionary.source_language ).toStrictEqual( input.source_language );
        expect( dictionary.target_language ).toStrictEqual( input.target_language );
    });
});
