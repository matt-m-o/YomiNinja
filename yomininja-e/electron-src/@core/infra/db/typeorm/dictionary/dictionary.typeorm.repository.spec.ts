import { DataSource, Repository } from 'typeorm';
import { RawDictionaryTag, getRawDictionaryTags } from '../../../../domain/dictionary/common/test/dictionary_tag_test_data';

import { DictionaryRepository } from '../../../../domain/dictionary/dictionary.repository';
import { Dictionary } from '../../../../domain/dictionary/dictionary';
import { DictionaryTypeOrmSchema } from './dictionary.schema';
import DictionaryTypeOrmRepository from './dictionary.typeorm.repository';


describe( "Dictionary TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< Dictionary >;
    let repo: DictionaryRepository;
    
    let rawPnTag: RawDictionaryTag;

    let dictionary: Dictionary;

    beforeEach( async () => {
        
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                DictionaryTypeOrmSchema,                
            ]
        });

        await dataSource.initialize();

        // repository by TypeOrm
        ormRepo = dataSource.getRepository( Dictionary );
        
        // actual repository
        repo = new DictionaryTypeOrmRepository( ormRepo );        

        rawPnTag = getRawDictionaryTags().find( item => item.name === 'pn' ) as RawDictionaryTag;
        expect( rawPnTag ).toBeDefined();
        if(!rawPnTag) return;
        

        dictionary = Dictionary.create({
            name: "JMdict (English)",
            order: 0,
            source_language: 'ja',
            target_language: 'en',
            enabled: true,
        });
        await dataSource.getRepository( Dictionary ).save( dictionary );        

    });

    it('should insert', async () => {

        await repo.insert(dictionary);

        const foundDictionary = await ormRepo.findOne({
            where: {
                id: dictionary.id
            },
        });

        expect( foundDictionary ).toStrictEqual( dictionary );
    });
    

    it('should find ONE by id or name', async () => {

        await ormRepo.save([ dictionary ]);

        const foundById = await repo.findOne({ id: dictionary.id });        
        expect( foundById ).toStrictEqual( dictionary );

        const foundByName = await repo.findOne({
            name: dictionary.name,            
        });        
        expect( foundByName ).toStrictEqual( dictionary );
    });

    it('should find MANY by source_language or target_language', async () => {        

        const dictionary2 = Dictionary.create({
            name: "JMdict (Spanish)",
            order: 0,
            source_language: 'ja',
            target_language: 'es',
            enabled: true,
        });        
        await ormRepo.save([
            dictionary,
            dictionary2
        ]);

        let foundDictionaries = await repo.findMany({ source_language: 'ja' });

        expect( foundDictionaries ).toHaveLength( 2 );
        expect( foundDictionaries?.[0] ).toStrictEqual( dictionary );
        expect( foundDictionaries?.[1] ).toStrictEqual( dictionary2 );


        foundDictionaries = await repo.findMany({ target_language: 'es' });

        expect( foundDictionaries ).toHaveLength( 1 );
        expect( foundDictionaries?.[0] ).toStrictEqual( dictionary2 );
    });

    it('should delete one', async () => {
        
        await ormRepo.save([ dictionary ]);

        await repo.delete( dictionary.id );

        const foundDictionary = await repo.findOne({ id: dictionary.id });
        
        expect( foundDictionary ).toBeFalsy();
    });
})