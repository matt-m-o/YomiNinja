import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { DictionaryTag } from '../../../../../domain/dictionary/dictionary_tag/dictionary_tag';
import { DictionaryTagTypeOrmSchema } from './dictionary_tag.schema';
import { RawDictionaryTag, getRawDictionaryTags } from '../../../../../domain/dictionary/common/test/dictionary_tag_test_data';

describe( 'DictionaryTag Entity Schema tests', () => {

    let dataSource: DataSource;
    let dictionaryTagTypeOrmRepo: Repository< DictionaryTag >;

    let rawDictionaryTags: RawDictionaryTag[];

    let rawPnTag: RawDictionaryTag | undefined;

    beforeEach( async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ DictionaryTagTypeOrmSchema ],
        });

        await dataSource.initialize();

        dictionaryTagTypeOrmRepo = dataSource.getRepository( DictionaryTag );

        rawDictionaryTags = getRawDictionaryTags();

        rawPnTag = rawDictionaryTags.find( item => item.name === 'pn' );
    });

    it("should insert a tag", async () => {

        if ( !rawPnTag ) return;

        const dictionaryTag = DictionaryTag.create({
            ...rawPnTag,
            dictionary_id: 'zxcv'
        });
        
        await dictionaryTagTypeOrmRepo.save(dictionaryTag);

        const foundTag = await dictionaryTagTypeOrmRepo.findOneBy({ id: dictionaryTag.id });

        expect( foundTag ).toBeDefined();
        expect( foundTag?.id ).toStrictEqual( dictionaryTag.id );
        expect( foundTag ).toStrictEqual( dictionaryTag );

    });

});