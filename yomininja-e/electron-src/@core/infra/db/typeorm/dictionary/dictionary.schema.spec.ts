import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Dictionary, DictionaryCreationInput } from '../../../../domain/dictionary/dictionary';
import { DictionaryTypeOrmSchema } from './dictionary.schema';

describe( 'Dictionary Entity Schema tests', () => {

    let dataSource: DataSource;
    let dictionaryTypeOrmRepo: Repository< Dictionary >;    
    

    beforeEach( async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                DictionaryTypeOrmSchema,                
            ],
        });

        await dataSource.initialize();    
        
        dictionaryTypeOrmRepo = dataSource.getRepository( Dictionary );
    });

    it("should insert a dictionary", async () => {

        const input: DictionaryCreationInput = {
            name: 'JMdict (English)',
            source_language: 'ja',
            target_language: 'en',
            enabled: true,
            order: 0,
        };

        const dictionary = Dictionary.create(input);        
        
        await dictionaryTypeOrmRepo.save(dictionary);

        let foundDictionary = await dictionaryTypeOrmRepo.findOne({
            where: {
                id: dictionary.id
            },
        });
        foundDictionary?.nullCheck();

        expect( foundDictionary ).toBeDefined();        
        expect( foundDictionary ).toStrictEqual( dictionary );        


    });

});