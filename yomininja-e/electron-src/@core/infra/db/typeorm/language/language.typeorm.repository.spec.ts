import { DataSource, Repository } from 'typeorm';
import { Language } from '../../../../domain/language/language';
import { LanguageRepository } from '../../../../domain/language/language.repository';
import { LanguageTypeOrmSchema } from './language.schema';
import LanguageTypeOrmRepository from './language.typeorm.repository';


describe( "Language TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< Language >;
    let repo: LanguageRepository;

    beforeEach( async () => {
        
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ LanguageTypeOrmSchema ]
        });

        await dataSource.initialize();

        // Settings Preset repository by TypeOrm
        ormRepo = dataSource.getRepository( Language );
        
        // actual repository
        repo = new LanguageTypeOrmRepository( ormRepo );
    });

    it('should insert', async () => {

        const language = Language.create({
            name: 'japanese',
            two_letter_code: 'ja'
        });

        await repo.insert( language );

        const foundLanguage = await ormRepo.findOneBy({ id: language.id });

        expect( foundLanguage ).toStrictEqual( language );
    });
   

    it('should find ONE by id and name', async () => {

        const languageJa = Language.create({
            name: 'japanese',
            two_letter_code: 'ja'
        });
        const languageEn = Language.create({
            name: 'english',
            two_letter_code: 'en'
        });
        await ormRepo.save([
            languageJa,
            languageEn
        ]);

        const foundById = await repo.findOne({ id: languageEn.id });
        const foundByName = await repo.findOne({ name: languageEn.name });        

        expect( foundById ).toStrictEqual( languageEn );
        expect( foundByName ).toStrictEqual( languageEn );
    });

    it('should update a language', async () => {

        const languageZh = Language.create({
            name: 'chinese',
            two_letter_code: 'ch'
        });
        await ormRepo.save([
            languageZh
        ]);

        let insertedLanguage = await repo.findOne({ id: languageZh.id });
        expect( insertedLanguage ).toBeDefined();
        if ( !insertedLanguage ) return;

        const update = {
            name: 'chinese (simplified)',
            two_letter_code: 'zh',
            bcp47_tag: 'zh-Hans',
        };

        insertedLanguage.name = update.name;
        insertedLanguage.two_letter_code = update.two_letter_code;
        insertedLanguage.bcp47_tag = update.bcp47_tag;

        await repo.update( insertedLanguage );

        const updatedLanguage = await repo.findOne({ id: languageZh.id });
        expect( updatedLanguage ).toBeDefined();
        if ( !updatedLanguage ) return;
        
        expect( updatedLanguage.name ).toStrictEqual( update.name );
        expect( updatedLanguage.two_letter_code ).toStrictEqual( update.two_letter_code );
        expect( updatedLanguage.bcp47_tag ).toStrictEqual( update.bcp47_tag );
    });


    it('should find ALL', async () => {

        const languageJa = Language.create({
            name: 'japanese',
            two_letter_code: 'ja'
        });
        const languageEn = Language.create({
            name: 'english',
            two_letter_code: 'en'
        });
        await ormRepo.save([
            languageJa,
            languageEn
        ]);        

        const foundLanguages = await repo.getAll();        

        expect( foundLanguages ).toHaveLength( 2 );
        expect( foundLanguages[0] ).toStrictEqual( languageJa );
        expect( foundLanguages[1] ).toStrictEqual( languageEn );
    });
    
})