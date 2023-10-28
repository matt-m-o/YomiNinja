import { RawDictionaryTag, getRawDictionaryTags } from "../common/test/dictionary_tag_test_data";
import { DictionaryTag, DictionaryTagCreationInput } from "./dictionary_tag";



describe("DictionaryTag tests", () => {

    let rawDictionaryTags: RawDictionaryTag[];

    beforeEach( () => {
        
        rawDictionaryTags = getRawDictionaryTags();
    });

    it("should define a dictionary tag", () => {

        const rawPnTag = rawDictionaryTags.find( rawTag => rawTag.name == 'pn' );
        if ( !rawPnTag ) return;

        const input: DictionaryTagCreationInput = {
            ...rawPnTag,
            dictionary_id: 'asdf'
        };

        const dictionaryTag = DictionaryTag.create( input );

        expect( dictionaryTag.id ).
            toStrictEqual( 
                DictionaryTag.generateId({
                    dictionary_id: input.dictionary_id,
                    tag_name: input.name
                }) 
            );
        expect( dictionaryTag.dictionary_id ).toStrictEqual( input.dictionary_id );
        expect( dictionaryTag.name ).toStrictEqual( input.name );
        expect( dictionaryTag.content ).toStrictEqual( input.content );
        expect( dictionaryTag.category ).toStrictEqual( input.category );
        expect( dictionaryTag.order ).toStrictEqual( input.order );
        expect( dictionaryTag.popularity_score ).toStrictEqual( input.popularity_score );
    });

});