import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { DictionaryTag } from '../../../../../domain/dictionary/dictionary_tag/dictionary_tag';

import { RawDictionaryTag, getRawDictionaryTags } from '../../../../../domain/dictionary/common/test/dictionary_tag_test_data';
import { DictionaryTagTypeOrmSchema } from '../dictionary_tag/dictionary_tag.schema';
import { DictionaryDefinition } from '../../../../../domain/dictionary/dictionary_definition/dictionary_definition';
import { RawDictionaryDefinition, getRawDictionaryDefinitions } from '../../../../../domain/dictionary/common/test/dictionary_definition_test_data';
import { DictionaryHeadword } from '../../../../../domain/dictionary/dictionary_headword/dictionary_headword';
import { DictionaryDefinitionTypeOrmSchema } from '../dictionary_definition/dictionary_definition.schema';
import { DictionaryHeadwordTypeOrmSchema } from './dictionary_headword.schema';

describe( 'DictionaryHeadword Entity Schema tests', () => {

    let dataSource: DataSource;
    let dictionaryHeadwordTypeOrmRepo: Repository< DictionaryHeadword >;
    let dictionaryDefinitionTypeOrmRepo: Repository< DictionaryDefinition >;

    let dictionaryPnTag: DictionaryTag;

    let rawDefinitions: RawDictionaryDefinition[];
    let rawAsokoDefinition: RawDictionaryDefinition | undefined;

    const dictionary_id = 1;

    const relations = [
        'tags',
        'definitions'
    ];

    beforeEach( async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                DictionaryHeadwordTypeOrmSchema,
                DictionaryDefinitionTypeOrmSchema,
                DictionaryTagTypeOrmSchema
            ],
        });

        await dataSource.initialize();

        const rawTags = getRawDictionaryTags();
        const rawPnTag = rawTags.find( item => item.name == 'pn' );
        expect( rawPnTag ).toBeDefined();
        if ( !rawPnTag ) return;        

        dictionaryPnTag = DictionaryTag.create({
            ...rawPnTag,
            dictionary_id
        });
        await dataSource.getRepository( DictionaryTag ).insert( dictionaryPnTag );

        rawDefinitions = getRawDictionaryDefinitions();
        rawAsokoDefinition = rawDefinitions.find( item => item.reading == 'あそこ' );
        expect( rawAsokoDefinition ).toBeDefined();
        if ( !rawAsokoDefinition ) return;        

        dictionaryDefinitionTypeOrmRepo = dataSource.getRepository( DictionaryDefinition);        
        dictionaryHeadwordTypeOrmRepo = dataSource.getRepository( DictionaryHeadword );
    });

    it("should insert a dictionary headword", async () => {
        
        if (!rawAsokoDefinition) return;

        const dictionaryHeadword = DictionaryHeadword.create({
            term: rawAsokoDefinition.term,
            reading: rawAsokoDefinition.reading,
            tags: [ dictionaryPnTag ],
        });
        
        await dictionaryHeadwordTypeOrmRepo.save(dictionaryHeadword);

        let foundHeadword = await dictionaryHeadwordTypeOrmRepo.findOne({
            where: {
                id: dictionaryHeadword.id
            },
            relations,            
        });        

        expect( foundHeadword ).toBeDefined();
        expect( foundHeadword?.id ).toStrictEqual( dictionaryHeadword.id );
        expect( foundHeadword ).toStrictEqual( dictionaryHeadword );
        expect( foundHeadword?.tags[0] ).toStrictEqual( dictionaryPnTag );
        expect( foundHeadword?.definitions ).toBeDefined();
        expect( foundHeadword?.definitions ).toHaveLength( 0 );


        const dictionaryDefinition = DictionaryDefinition.create({
            ...rawAsokoDefinition,
            dictionary_headword_id: dictionaryHeadword.id,
            dictionary_id,
            tags: [ dictionaryPnTag ],
            popularity_score: rawAsokoDefinition.popularity
        });
        await dictionaryDefinitionTypeOrmRepo.save( dictionaryDefinition );

        foundHeadword = await dictionaryHeadwordTypeOrmRepo.findOne({
            where: {
                id: dictionaryHeadword.id
            },
            relations
        });

        expect( foundHeadword?.definitions ).toBeDefined();
        expect( foundHeadword?.definitions[0] ).toStrictEqual( dictionaryDefinition );

    });

});