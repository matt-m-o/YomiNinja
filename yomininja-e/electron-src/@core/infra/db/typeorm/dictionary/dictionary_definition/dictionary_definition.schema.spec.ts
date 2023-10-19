import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { DictionaryTag } from '../../../../../domain/dictionary/dictionary_tag/dictionary_tag';

import { RawDictionaryTag, getRawDictionaryTags } from '../../../../../domain/dictionary/common/test/dictionary_tag_test_data';
import { DictionaryDefinitionTypeOrmSchema } from './dictionary_definition.schema';
import { DictionaryTagTypeOrmSchema } from '../dictionary_tag/dictionary_tag.schema';
import { DictionaryDefinition } from '../../../../../domain/dictionary/dictionary_entry_definition/dictionary_definition';
import { RawDictionaryDefinition, getRawDictionaryDefinitions } from '../../../../../domain/dictionary/common/test/dictionary_definition_test_data';

describe( 'DictionaryDefinition Entity Schema tests', () => {

    let dataSource: DataSource;
    let dictionaryDefinitionTypeOrmRepo: Repository< DictionaryDefinition >;    

    let dictionaryTag: DictionaryTag;

    const dictionary_id = 'qwer';

    let rawDefinitions: RawDictionaryDefinition[];

    const relations = [
        'tags',
    ];

    beforeEach( async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
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
    });

    it("should insert a tag", async () => {

        const rawDefinition = rawDefinitions.find( item => item.reading == 'あそこ' );
        if (!rawDefinition) return;        

        const dictionaryDefinition = DictionaryDefinition.create({            
            dictionary_id,
            dictionary_headword_id: 'asdf',
            tags: [ dictionaryTag ],
            popularity_score: rawDefinition.popularity,
            definitions: [...rawDefinition.definitions ]
        });
        
        await dictionaryDefinitionTypeOrmRepo.save(dictionaryDefinition);

        const foundDefinition = await dictionaryDefinitionTypeOrmRepo.findOne({
            where: {
                id: dictionaryDefinition.id
            },
            relations
        });        

        expect( foundDefinition ).toBeDefined();
        expect( foundDefinition?.id ).toStrictEqual( dictionaryDefinition.id );
        expect( foundDefinition ).toStrictEqual( dictionaryDefinition );
        expect( foundDefinition?.tags[0] ).toStrictEqual( dictionaryTag );

    });

});