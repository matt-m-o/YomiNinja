import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { DictionaryTag } from '../../../../../domain/dictionary/dictionary_tag/dictionary_tag';

import { RawDictionaryTag, getRawDictionaryTags } from '../../../../../domain/dictionary/common/test/dictionary_tag_test_data';
import { DictionaryDefinitionTypeOrmSchema } from './dictionary_definition.schema';
import { DictionaryTagTypeOrmSchema } from '../dictionary_tag/dictionary_tag.schema';
import { DictionaryDefinition } from '../../../../../domain/dictionary/dictionary_definition/dictionary_definition';
import { RawDictionaryDefinition, getRawDictionaryDefinitions } from '../../../../../domain/dictionary/common/test/dictionary_definition_test_data';
import { DictionaryHeadword } from '../../../../../domain/dictionary/dictionary_headword/dictionary_headword';
import { DictionaryHeadwordTypeOrmSchema } from '../dictionary_headword/dictionary_headword.schema';

describe( 'DictionaryDefinition Entity Schema tests', () => {

    let dataSource: DataSource;
    let dictionaryDefinitionTypeOrmRepo: Repository< DictionaryDefinition >;    

    let dictionaryTag: DictionaryTag;

    const dictionary_id = 'qwer';

    let rawDefinitions: RawDictionaryDefinition[];

    let dictionaryHeadword: DictionaryHeadword;

    const relations = [
        'tags',
        'headword'
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
        if ( !rawPnTag ) return;

        rawDefinitions = getRawDictionaryDefinitions();

        dictionaryTag = DictionaryTag.create({
            ...rawPnTag,
            dictionary_id
        });
        await dataSource.getRepository( DictionaryTag ).insert( dictionaryTag );

        dictionaryDefinitionTypeOrmRepo = dataSource.getRepository( DictionaryDefinition );

        
        const asokoRawDefinition = rawDefinitions.find( rawDefinition => rawDefinition.reading == 'あそこ' );

        expect( asokoRawDefinition ).toBeDefined();

        if ( !asokoRawDefinition ) return;

        dictionaryHeadword = DictionaryHeadword.create({
            term: asokoRawDefinition.term,
            reading: asokoRawDefinition.reading,
            definitions: [],
            tags: []
        });

        await dataSource.getRepository( DictionaryHeadword ).insert( dictionaryHeadword );
    });

    it("should insert a definition", async () => {

        const rawDefinition = rawDefinitions.find( item => item.reading == 'あそこ' );
        if (!rawDefinition) return;        

        const dictionaryDefinition = DictionaryDefinition.create({            
            dictionary_id,
            dictionary_headword_id: dictionaryHeadword.id,
            tags: [ dictionaryTag ],
            popularity_score: rawDefinition.popularity,
            definitions: [...rawDefinition.definitions ],
            headword: dictionaryHeadword
        });
        
        await dictionaryDefinitionTypeOrmRepo.save(dictionaryDefinition);

        const foundDefinition = await dictionaryDefinitionTypeOrmRepo.findOne({
            where: {
                id: dictionaryDefinition.id
            },
            relations
        });

        foundDefinition?.headword?.nullCheck();        

        expect( foundDefinition ).toBeDefined();
        expect( foundDefinition?.id ).toStrictEqual( 1 );
        expect( foundDefinition ).toStrictEqual( dictionaryDefinition );
        expect( foundDefinition?.headword ).toBeDefined();
        expect( foundDefinition?.tags[0] ).toStrictEqual( dictionaryTag );

    });

});