import { RawDictionaryDefinition, getRawDictionaryDefinitions } from "../common/test/dictionary_definition_test_data";
import { RawDictionaryTag, getRawDictionaryTags } from "../common/test/dictionary_tag_test_data";
import { DictionaryDefinition } from "../dictionary_entry_definition/dictionary_definition";
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

    beforeEach( () => {

        rawDictionaryTags = getRawDictionaryTags();
        rawDictionaryDefinitions = getRawDictionaryDefinitions();

        const rawPnTag = rawDictionaryTags.find( rawTag => rawTag.name == 'pn' );
        const rawUkTag = rawDictionaryTags.find( rawTag => rawTag.name == 'uk' );
        const rawRkTag = rawDictionaryTags.find( rawTag => rawTag.name == 'rk' ); 

        if ( !rawPnTag || !rawUkTag || !rawRkTag ) return;

        dictionaryTagPn = DictionaryTag.create({
            ...rawPnTag,
            dictionary_id: 'asdf'
        });        

        dictionaryTagUk = DictionaryTag.create({
            ...rawUkTag,
            dictionary_id: 'asdf'
        });

        dictionaryTagRk = DictionaryTag.create({
            ...rawUkTag,
            dictionary_id: 'asdf'
        });

        asokoRawDefinition = rawDictionaryDefinitions.find( rawDefinition => rawDefinition.reading == 'あそこ' );
                
    });

    it('should define a dictionary headword', () => {

        if ( !asokoRawDefinition ) return;

        const input: DictionaryHeadwordCreationInput = {
            term: asokoRawDefinition.term,
            reading: asokoRawDefinition.reading,            
        };

        const dictionaryHeadword = DictionaryHeadword.create(input);

        asokoDefinition = DictionaryDefinition.create({
            dictionary_headword_id: dictionaryHeadword.id,
            definitions: asokoRawDefinition.definitions,
            popularity_score: asokoRawDefinition.popularity,
            tags: [ dictionaryTagPn, dictionaryTagUk ],
            dictionary_id: 'qwer'
        });

        dictionaryHeadword.addDefinition( asokoDefinition );

        expect( dictionaryHeadword.id ).toBeDefined();
        expect( dictionaryHeadword.definitions ).toHaveLength( 1 );
        expect( dictionaryHeadword.definitions[0] ).toStrictEqual( asokoDefinition );
        expect( dictionaryHeadword.definitions[0].id ).toStrictEqual( dictionaryHeadword.id );        
    });
});