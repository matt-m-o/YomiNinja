import { getRawFuriganaDictionaryItems } from "../../../application/use_cases/dictionary/import_furigana_dictionary/furigana_dictionary_test_data";
import { RawDictionaryDefinition, getRawDictionaryDefinitions } from "../common/test/dictionary_definition_test_data";
import { RawDictionaryTag, getRawDictionaryTags } from "../common/test/dictionary_tag_test_data";
import { DictionaryDefinition } from "../dictionary_definition/dictionary_definition";
import { DictionaryTag } from "../dictionary_tag/dictionary_tag";
import { DictionaryHeadword, DictionaryHeadwordCreationInput } from "./dictionary_headword";



describe('DictionaryHeadword tests', () => {

    let rawDictionaryTags: RawDictionaryTag[];
    let rawDictionaryDefinitions: RawDictionaryDefinition[];

    let asokoRawDefinition: RawDictionaryDefinition | undefined;

    let dictionaryTagPn: DictionaryTag;
    let dictionaryTagRk: DictionaryTag;
    let dictionaryTagUk: DictionaryTag;
    
    let asokoDefinition: DictionaryDefinition;

    const dictionary_id = 1;
    
    beforeEach( () => {
        
        rawDictionaryTags = getRawDictionaryTags();
        rawDictionaryDefinitions = getRawDictionaryDefinitions();

        const rawPnTag = rawDictionaryTags.find( rawTag => rawTag.name == 'pn' );
        const rawUkTag = rawDictionaryTags.find( rawTag => rawTag.name == 'uk' );
        const rawRkTag = rawDictionaryTags.find( rawTag => rawTag.name == 'rK' ); 

        expect( rawPnTag ).toBeDefined();
        expect( rawUkTag ).toBeDefined();
        expect( rawRkTag ).toBeDefined();

        if ( !rawPnTag || !rawUkTag || !rawRkTag ) return;

        dictionaryTagPn = DictionaryTag.create({
            ...rawPnTag,
            dictionary_id
        });        

        dictionaryTagUk = DictionaryTag.create({
            ...rawUkTag,
            dictionary_id
        });

        dictionaryTagRk = DictionaryTag.create({
            ...rawUkTag,
            dictionary_id
        });

        asokoRawDefinition = rawDictionaryDefinitions.find( rawDefinition => rawDefinition.reading == 'あそこ' );
        expect( asokoRawDefinition ).toBeDefined();
    });

    it('should define a dictionary headword', () => {

        expect( asokoRawDefinition ).toBeDefined();

        if ( !asokoRawDefinition ) return;

        const input: DictionaryHeadwordCreationInput = {
            term: asokoRawDefinition.term,
            reading: asokoRawDefinition.reading,            
        };

        const dictionaryHeadword = DictionaryHeadword.create(input);
        expect( dictionaryHeadword.getPopularityScore() ).toStrictEqual( 0 );

        asokoDefinition = DictionaryDefinition.create({
            dictionary_headword_id: dictionaryHeadword.id,
            definitions: asokoRawDefinition.definitions,
            popularity_score: asokoRawDefinition.popularity,
            tags: [ dictionaryTagPn, dictionaryTagUk ],
            dictionary_id: 2
        });        

        dictionaryHeadword.addDefinition( asokoDefinition );
        expect( dictionaryHeadword.id ).toBeDefined();
        expect( dictionaryHeadword.definitions ).toHaveLength( 1 );
        expect( dictionaryHeadword.definitions[0] ).toStrictEqual( asokoDefinition );
        expect( dictionaryHeadword.definitions[0].dictionary_headword_id )
            .toStrictEqual( dictionaryHeadword.id );
        expect( dictionaryHeadword.getPopularityScore() ).toStrictEqual( 3 );

        const furigana = getRawFuriganaDictionaryItems()
            .find( item => item.text == dictionaryHeadword.term && item.reading == dictionaryHeadword.reading )
            ?.furigana;
        expect( furigana ).toBeDefined();
        if ( !furigana ) return;

        dictionaryHeadword.setFurigana( furigana );
        expect( dictionaryHeadword.furigana ).toBeDefined();
        expect( dictionaryHeadword.furigana ).toStrictEqual( furigana );
    });
});