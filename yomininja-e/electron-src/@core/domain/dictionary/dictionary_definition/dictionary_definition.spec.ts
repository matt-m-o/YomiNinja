import { RawDictionaryDefinition, getRawDictionaryDefinitions } from "../common/test/dictionary_definition_test_data";
import { RawDictionaryTag, getRawDictionaryTags } from "../common/test/dictionary_tag_test_data";
import { DictionaryTag } from "../dictionary_tag/dictionary_tag";
import { DictionaryDefinition, DictionaryDefinitionCreationInput } from "./dictionary_definition";



describe("DictionaryDefinition tests", () => {
    
    let rawDictionaryTags: RawDictionaryTag[];
    let rawDictionaryDefinitions: RawDictionaryDefinition[];

    let dictionaryTagPn: DictionaryTag;    
    let dictionaryTagUk: DictionaryTag;

    const dictionary_id = 1;

    beforeEach( () => {

        rawDictionaryTags = getRawDictionaryTags();
        rawDictionaryDefinitions = getRawDictionaryDefinitions();

        const rawPnTag = rawDictionaryTags.find( rawTag => rawTag.name == 'pn' );        
        const rawUkTag = rawDictionaryTags.find( rawTag => rawTag.name == 'uk' );

        if ( !rawPnTag || !rawUkTag ) return;

        dictionaryTagPn = DictionaryTag.create({
            ...rawPnTag,
            dictionary_id
        });        

        dictionaryTagUk = DictionaryTag.create({
            ...rawUkTag,
            dictionary_id
        });

    });

    it("should create a dictionary definition", () => {

        const asokoRawDefinition = rawDictionaryDefinitions.
            find( rawDefinition => rawDefinition.reading == 'あそこ' );

        if ( !asokoRawDefinition ) return;

        const input: DictionaryDefinitionCreationInput = {
            dictionary_headword_id: 1234,
            definitions: asokoRawDefinition.definitions,
            popularity_score: asokoRawDefinition.popularity,
            tags: [ dictionaryTagPn, dictionaryTagUk ],
            dictionary_id: 2
        };

        const dictionaryDefinition = DictionaryDefinition.create( input );

        expect( dictionaryDefinition.id ).not.toBeDefined();
        expect( dictionaryDefinition.dictionary_headword_id ).toStrictEqual( input.dictionary_headword_id );
        expect( dictionaryDefinition.definitions ).toStrictEqual( input.definitions );
        expect( dictionaryDefinition.popularity_score ).toStrictEqual( input.popularity_score );
        expect( dictionaryDefinition.tags ).toStrictEqual( input.tags );
        expect( dictionaryDefinition.dictionary_id ).toStrictEqual( input.dictionary_id );        
    });

});