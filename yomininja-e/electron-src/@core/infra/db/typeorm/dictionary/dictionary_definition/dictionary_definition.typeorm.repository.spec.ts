import { DataSource, Repository } from 'typeorm';
import { DictionaryTag } from '../../../../../domain/dictionary/dictionary_tag/dictionary_tag';
import { DictionaryTagRepository } from '../../../../../domain/dictionary/dictionary_tag/dictionary_tag.repository';
import { RawDictionaryTag, getRawDictionaryTags } from '../../../../../domain/dictionary/common/test/dictionary_tag_test_data';
import { DictionaryDefinitionTypeOrmSchema } from './dictionary_definition.schema';
import { DictionaryTagTypeOrmSchema } from '../dictionary_tag/dictionary_tag.schema';
import { DictionaryDefinition } from '../../../../../domain/dictionary/dictionary_definition/dictionary_definition';
import DictionaryDefinitionTypeOrmRepository from './dictionary_definition.typeorm.repository';
import { DictionaryDefinitionRepository } from '../../../../../domain/dictionary/dictionary_definition/dictionary_definition.repository';
import { RawDictionaryDefinition, getRawDictionaryDefinitions } from '../../../../../domain/dictionary/common/test/dictionary_definition_test_data';
import { DictionaryHeadwordTypeOrmSchema } from '../dictionary_headword/dictionary_headword.schema';
import { DictionaryHeadwordId } from '../../../../../domain/dictionary/dictionary_headword/dictionary_headword';


describe( "Dictionary Definition TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< DictionaryDefinition >;
    let repo: DictionaryDefinitionRepository;
    
    let dictionaryTag: DictionaryTag;

    let definition: DictionaryDefinition;

    let rawDefinition: RawDictionaryDefinition | undefined;

    const dictionary_headword_id: DictionaryHeadwordId = 1234;
    const dictionary_id = 'zxcv';

    beforeEach( async () => {
        
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                DictionaryTagTypeOrmSchema,
                DictionaryDefinitionTypeOrmSchema,
                DictionaryHeadwordTypeOrmSchema,
            ]
        });

        await dataSource.initialize();

        // repository by TypeOrm
        ormRepo = dataSource.getRepository( DictionaryDefinition );
        
        // actual repository
        repo = new DictionaryDefinitionTypeOrmRepository( ormRepo );

        const rawDictionaryTags = getRawDictionaryTags();

        const rawPnTag = rawDictionaryTags.find( item => item.name === 'pn' );
        expect( rawPnTag ).toBeDefined();
        if(!rawPnTag) return;

        dictionaryTag = DictionaryTag.create({
            ...rawPnTag,
            dictionary_id: 'asdf',
        });
        await dataSource.getRepository( DictionaryTag ).insert( dictionaryTag );

        rawDefinition = getRawDictionaryDefinitions()
            .find( rawDefinition => rawDefinition.reading == 'あそこ' );
        expect( rawDefinition ).toBeDefined();
        if ( !rawDefinition ) return;

        definition = DictionaryDefinition.create({
            ...rawDefinition,
            dictionary_headword_id,
            dictionary_id,
            popularity_score: rawDefinition.popularity,
            tags: [ dictionaryTag ]
        });

    });

    it('should insert', async () => {

        await repo.insert([ definition ]);

        const foundDefinition = await ormRepo.findOneBy({ id: definition.id });

        expect( foundDefinition ).toStrictEqual( definition );
    });    

    it('should find ONE by id', async () => {

        await ormRepo.save([ definition ]);

        const foundById = await repo.findOne({ id: definition.id });        

        expect( foundById ).toStrictEqual( definition );
    });

    it('should find MANY by dictionary_headword_id and dictionary_id', async () => {

        if (!rawDefinition) return;

        const definition2 = DictionaryDefinition.create({
            ...rawDefinition,
            dictionary_id,
            dictionary_headword_id,
            popularity_score: rawDefinition.popularity,
            tags: [ dictionaryTag ]
        });
        await ormRepo.save([
            definition,
            definition2
        ]);

        const foundDefinitions = await repo.findMany({ dictionary_headword_id });        

        expect( foundDefinitions ).toHaveLength( 2 );
        expect( foundDefinitions?.[0] ).toStrictEqual( definition );
        expect( foundDefinitions?.[1] ).toStrictEqual( definition2 );
    });

    it('should delete one', async () => {
        
        await ormRepo.save([ definition ]);        

        await repo.delete( definition.id );

        const foundDefinition = await repo.findOne({ id: definition.id });
        
        expect( foundDefinition ).toBeFalsy();        
    });
})