import { DataSource, Repository } from 'typeorm';
import { DictionaryTag } from '../../../../../domain/dictionary/dictionary_tag/dictionary_tag';
import { DictionaryTagRepository } from '../../../../../domain/dictionary/dictionary_tag/dictionary_tag.repository';
import { DictionaryTagTypeOrmSchema } from './dictionary_tag.schema';
import DictionaryTagTypeOrmRepository from './dictionary_tag.typeorm.repository';
import { RawDictionaryTag, getRawDictionaryTags } from '../../../../../domain/dictionary/common/test/dictionary_tag_test_data';


describe( "Dictionary Tag TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< DictionaryTag >;
    let repo: DictionaryTagRepository;

    let rawPnTag: RawDictionaryTag | undefined;
    let dictionaryTag: DictionaryTag;

    beforeEach( async () => {
        
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ DictionaryTagTypeOrmSchema ]
        });

        await dataSource.initialize();

        // repository by TypeOrm
        ormRepo = dataSource.getRepository( DictionaryTag );
        
        // actual repository
        repo = new DictionaryTagTypeOrmRepository( ormRepo );

        const rawDictionaryTags = getRawDictionaryTags();

        rawPnTag = rawDictionaryTags.find( item => item.name === 'pn' );
        expect( rawPnTag ).toBeDefined();
        if(!rawPnTag) return;

        dictionaryTag = DictionaryTag.create({
            ...rawPnTag,
            dictionary_id: 'asdf',
        })
    });

    it('should insert', async () => {        

        await repo.insert([ dictionaryTag ]);

        const foundTag = await ormRepo.findOneBy({ id: dictionaryTag.id });

        expect( foundTag ).toStrictEqual( dictionaryTag );
    });    

    it('should find ONE by id and name', async () => {

        await ormRepo.save([ dictionaryTag ]);

        const foundById = await repo.findOne({ id: dictionaryTag.id });
        const foundByName = await repo.findOne({ name: dictionaryTag.name });        

        expect( foundById ).toStrictEqual( dictionaryTag );
        expect( foundByName ).toStrictEqual( dictionaryTag );
    });

    it('should find ALL', async () => {

        const rawUkTag = getRawDictionaryTags()
            .find( item => item.name === 'uk' );
        expect( rawUkTag ).toBeDefined();
        if( !rawUkTag ) return;
        
        const ukDictionaryTag = DictionaryTag.create({ ...rawUkTag, dictionary_id: 'asdf' });
        await ormRepo.save([
            dictionaryTag,
            ukDictionaryTag
        ]);        

        const foundTags = await repo.getAll();        

        expect( foundTags ).toHaveLength( 2 );
        expect( foundTags[0] ).toStrictEqual( dictionaryTag );
        expect( foundTags[1] ).toStrictEqual( ukDictionaryTag );
    });

    it('should delete one', async () => {
        
        await ormRepo.save([ dictionaryTag ]);        

        await repo.delete( dictionaryTag.id );

        const foundTag = await repo.findOne({ id: dictionaryTag.id });
        
        expect( foundTag ).toBeFalsy();        
    });
})