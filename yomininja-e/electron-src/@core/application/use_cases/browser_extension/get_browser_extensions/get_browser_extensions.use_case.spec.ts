import { DataSource } from 'typeorm';
import { BrowserExtensionTypeOrmSchema } from '../../../../infra/db/typeorm/browser_extension/browser_extension.schema';
import BrowserExtensionTypeOrmRepository from '../../../../infra/db/typeorm/browser_extension/browser_extension.typeorm.repository';
import { BrowserExtension } from '../../../../domain/browser_extension/browser_extension';
import { GetBrowserExtensionsUseCase } from './get_browser_extensions.use_case';


describe("GetBrowserExtensionsUseCase tests", () => {    
        
    let useCase: GetBrowserExtensionsUseCase;

    let extensionsRepo: BrowserExtensionTypeOrmRepository;

    beforeEach( async () => {

        const dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                BrowserExtensionTypeOrmSchema,
            ],
        });

        await dataSource.initialize();


        extensionsRepo = new BrowserExtensionTypeOrmRepository(
            dataSource.getRepository( BrowserExtension )
        );

        useCase = new GetBrowserExtensionsUseCase({
            extensionsRepo
        });
        
    });

    it("should get all browser extensions", async () => {      
        
        const extension1 = BrowserExtension.create({
            id: 'asdf',
            name: 'x1',
            version: '1.0.0',
            enabled: true,
            description: ''
        });
        const extension2 = BrowserExtension.create({
            id: 'qwer',
            name: 'x2',
            version: '1.0.0',
            enabled: true,
            description: ''
        });
        await extensionsRepo.insert( extension1 );
        await extensionsRepo.insert( extension2 );

        const output = await useCase.execute();

        expect( output ).toHaveLength( 2 );
        expect( output ).toContainEqual( extension1 );
        expect( output ).toContainEqual( extension2 );

    });
    
});