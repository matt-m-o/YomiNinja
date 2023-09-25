import { DataSource, Repository } from 'typeorm';
import { Language } from '../../../../domain/language/language';
import { LanguageTypeOrmSchema } from './language.schema';



describe( 'Language Entity Schema tests', () => {

    let dataSource: DataSource;
    let languageTypeOrmRepo: Repository< Language >;

    beforeEach( async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ LanguageTypeOrmSchema ],
        });

        await dataSource.initialize();

        languageTypeOrmRepo = dataSource.getRepository( Language );
    });

    it("should insert", async () => {

        const language = Language.create({
            name: 'japanese',
            two_letter_code: 'ja'
        });
        
        await languageTypeOrmRepo.save(language);

        const foundLanguage = await languageTypeOrmRepo.findOneBy({ id: language.id });
        

        expect( foundLanguage ).toBeDefined();
        expect( foundLanguage?.id ).toStrictEqual( language.id );
        expect( foundLanguage ).toStrictEqual( language );

    });

});