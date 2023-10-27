import { DataSource, Repository } from 'typeorm';
import { DictionaryTag } from '../../../../../domain/dictionary/dictionary_tag/dictionary_tag';
import { RawDictionaryTag, getRawDictionaryTags } from '../../../../../domain/dictionary/common/test/dictionary_tag_test_data';
import { DictionaryDefinitionTypeOrmSchema } from '../dictionary_definition/dictionary_definition.schema';
import { DictionaryTagTypeOrmSchema } from '../dictionary_tag/dictionary_tag.schema';
import { DictionaryDefinition } from '../../../../../domain/dictionary/dictionary_definition/dictionary_definition';
import { RawDictionaryDefinition, getRawDictionaryDefinitions } from '../../../../../domain/dictionary/common/test/dictionary_definition_test_data';
import { DictionaryHeadwordTypeOrmSchema } from '../dictionary_headword/dictionary_headword.schema';
import { DictionaryHeadword, DictionaryHeadwordId } from '../../../../../domain/dictionary/dictionary_headword/dictionary_headword';
import { DictionaryHeadwordRepository } from '../../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository';
import DictionaryHeadwordTypeOrmRepository from './dictionary_headword.typeorm.repository';
import { getRawFuriganaDictionaryItems } from '../../../../../application/use_cases/dictionary/import_furigana_dictionary/furigana_dictionary_test_data';


describe( "Dictionary Headword TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< DictionaryHeadword >;
    let repo: DictionaryHeadwordRepository;
    
    let dictionaryTag: DictionaryTag;

    let definition: DictionaryDefinition;    

    let rawDefinition: RawDictionaryDefinition | undefined;

    let headword: DictionaryHeadword;
    
    let dictionary_headword_id: DictionaryHeadwordId;
    const dictionary_id = 'zxcv';

    beforeEach( async () => {
        
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                DictionaryHeadwordTypeOrmSchema,
                DictionaryDefinitionTypeOrmSchema,
                DictionaryTagTypeOrmSchema,
            ]
        });

        await dataSource.initialize();

        // repository by TypeOrm
        ormRepo = dataSource.getRepository( DictionaryHeadword );
        
        // actual repository
        repo = new DictionaryHeadwordTypeOrmRepository( ormRepo );        

        const rawPnTag = getRawDictionaryTags().find( item => item.name === 'pn' );
        expect( rawPnTag ).toBeDefined();
        if(!rawPnTag) return;

        dictionaryTag = DictionaryTag.create({
            ...rawPnTag,
            dictionary_id,
        });
        await dataSource.getRepository( DictionaryTag ).save( dictionaryTag );

        rawDefinition = getRawDictionaryDefinitions()
            .find( rawDefinition => rawDefinition.reading == 'あそこ' );
        expect( rawDefinition ).toBeDefined();
        if ( !rawDefinition ) return;

        dictionary_headword_id = DictionaryHeadword.generateId({
            term: rawDefinition.term,
            reading: rawDefinition.reading
        })

        definition = DictionaryDefinition.create({
            ...rawDefinition,
            dictionary_headword_id,
            dictionary_id,
            popularity_score: rawDefinition.popularity,
            tags: [ dictionaryTag ]
        });
        await dataSource.getRepository( DictionaryDefinition ).save( definition ); 
        
        const furigana = getRawFuriganaDictionaryItems()
            .find( item => item.text == rawDefinition?.term && item.reading == rawDefinition.reading )
            ?.furigana;

        headword = DictionaryHeadword.create({
            ...rawDefinition,
            tags: [ dictionaryTag ],
            definitions: [ definition ],
            furigana,
        });

    });

    it('should insert', async () => {

        await repo.insert([ headword ]);

        const foundHeadword = await ormRepo.findOne({
            where: {
                id: headword.id
            },
            relations: [ 'tags', 'definitions' ],
        });

        expect( foundHeadword ).toStrictEqual( headword );
        expect( foundHeadword?.furigana ).toBeDefined();
    });

    it('should check if EXISTS', async () => {

        await ormRepo.save([ headword ]);

        let exists = await repo.exist({ id: headword.id });
        expect( exists ).toBeTruthy();

        exists = await repo.exist({
            term: headword.term,
            reading: headword.reading
        });
        expect( exists ).toBeTruthy();        
    });

    it('should find ONE by id or (term and reading)', async () => {

        await ormRepo.save([ headword ]);

        const foundById = await repo.findOne({ id: headword.id });
        expect( foundById ).toStrictEqual( headword );

        const foundByTermAndId = await repo.findOne({
            term: headword.term,
            reading: headword.reading
        });
        expect( foundByTermAndId ).toStrictEqual( headword );
    });

    it('should find MANY by term or reading', async () => {

        if (!rawDefinition) return;

        const headword2 = DictionaryHeadword.create({
            ...rawDefinition,
            tags: [ dictionaryTag ],
            definitions: [],
            reading: rawDefinition.reading+'2',
        });        
        await ormRepo.save([
            headword,
            headword2
        ]);

        const foundHeadwords = await repo.findMany({ term: rawDefinition.term });        

        expect( foundHeadwords ).toHaveLength( 2 );
        expect( foundHeadwords?.[0] ).toStrictEqual( headword );
        expect( foundHeadwords?.[1] ).toStrictEqual( headword2 );
    });

    it('should find MANY LIKE term or reading', async () => {

        if (!rawDefinition) return;

        const headword2 = DictionaryHeadword.create({
            ...rawDefinition,
            tags: [ dictionaryTag ],
            definitions: [],
            term: rawDefinition.term + 'Z',
            reading: rawDefinition.reading+'ZED'
        });        
        await ormRepo.save([
            headword,
            headword2
        ]);

        const foundHeadwordsByTerm = await repo.findManyLike({
            term: headword2.term,
        });

        expect( foundHeadwordsByTerm ).toHaveLength( 2 );
        expect( foundHeadwordsByTerm?.[0] ).toStrictEqual( headword );
        expect( foundHeadwordsByTerm?.[1] ).toStrictEqual( headword2 );


        const foundHeadwordsByReading = await repo.findManyLike({
            reading: headword2.reading
        });

        expect( foundHeadwordsByReading ).toHaveLength( 2 );
        expect( foundHeadwordsByReading?.[0] ).toStrictEqual( headword );
        expect( foundHeadwordsByReading?.[1] ).toStrictEqual( headword2 );
    });

    it('should delete one', async () => {
        
        await ormRepo.save([ headword ]);        

        await repo.delete( headword.id );

        const foundHeadword = await repo.findOne({ id: headword.id });
        
        expect( foundHeadword ).toBeFalsy();        
    });
})