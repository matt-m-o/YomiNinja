import { DataSource, Repository } from 'typeorm';
import { BrowserExtension } from '../../../../domain/browser_extension/browser_extension';
import { BrowserExtensionRepository } from '../../../../domain/browser_extension/browser_extension.repository';
import { BrowserExtensionTypeOrmSchema } from './browser_extension.schema';
import BrowserExtensionTypeOrmRepository from './browser_extension.typeorm.repository';


describe( "BrowserExtension TypeOrm Repository tests", () => {
    
    let dataSource: DataSource;
    let ormRepo: Repository< BrowserExtension >;
    let repo: BrowserExtensionRepository;

    beforeEach( async () => {
        
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [ BrowserExtensionTypeOrmSchema ]
        });

        await dataSource.initialize();

        // Settings Preset repository by TypeOrm
        ormRepo = dataSource.getRepository( BrowserExtension );
        
        // actual repository
        repo = new BrowserExtensionTypeOrmRepository( ormRepo );
    });

    it('should insert', async () => {

        const extension = BrowserExtension.create({
            id: 'asdf',
            name: 'x',
            version: '1.0.1'
        });

        await repo.insert( extension );

        const foundExtension = await ormRepo.findOneBy({ id: extension.id });

        expect( foundExtension ).toStrictEqual( extension );
    });
   

    it('should find ONE by id', async () => {

        const extension1 = BrowserExtension.create({
            id: 'asdf',
            name: 'x1',
            version: '1.0.0'
        });
        const extension2 = BrowserExtension.create({
            id: 'zxcv',
            name: 'english',
            version: '1.0.0'
        });
        await ormRepo.save([
            extension1,
            extension2
        ]);

        const foundById = await repo.findOne({ id: extension2.id });

        expect( foundById ).toStrictEqual( extension2 );
    });

    it('should find ALL', async () => {

        const extension1 = BrowserExtension.create({
            id: 'asdf',
            name: 'x1',
            version: '1.0.0'
        });
        const extension2 = BrowserExtension.create({
            id: 'zxcv',
            name: 'english',
            version: '1.0.0'
        });
        await ormRepo.save([
            extension1,
            extension2
        ]);        

        const foundExtensions = await repo.getAll();        

        expect( foundExtensions ).toHaveLength( 2 );
        expect( foundExtensions ).toContainEqual( extension1 );
        expect( foundExtensions ).toContainEqual( extension2 );
    });
    
})