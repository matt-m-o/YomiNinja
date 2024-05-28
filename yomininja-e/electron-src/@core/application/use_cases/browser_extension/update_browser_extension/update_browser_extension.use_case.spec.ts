import { DataSource } from 'typeorm';
import { BrowserExtensionTypeOrmSchema } from '../../../../infra/db/typeorm/browser_extension/browser_extension.schema';
import { UpdateBrowserExtensionUseCase, UpdateBrowserExtension_Input } from './update_browser_extension.use_case';
import BrowserExtensionTypeOrmRepository from '../../../../infra/db/typeorm/browser_extension/browser_extension.typeorm.repository';
import { BrowserExtension } from '../../../../domain/browser_extension/browser_extension';


describe("BrowserExtensionUseCase tests", () => {
        
    let useCase: UpdateBrowserExtensionUseCase;

    let extensionsRepo: BrowserExtensionTypeOrmRepository;

    let extension: BrowserExtension;

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

        extension = BrowserExtension.create({
            id: 'asdf',
            name: 'x',
            description: 'qwer',
            version: '1.0.0',
            enabled: true
        });
        await extensionsRepo.insert( extension );


        useCase = new UpdateBrowserExtensionUseCase({
            extensionsRepo
        });
        
    });

    it("should create a browser extension", async () => {        

        const input: UpdateBrowserExtension_Input = {
            id: 'asdf',
            name: 'x',
            description: 'uipo',
            version: '1.0.0',
            enabled: false
        };

        const output = await useCase.execute(input);
        
        const foundExtension = await extensionsRepo.findOne({
            id: input.id
        });

        expect( output ).toStrictEqual( output );

        expect( foundExtension?.id ).toStrictEqual( input.id );
        expect( foundExtension?.name ).toStrictEqual( input.name );
        expect( foundExtension?.description ).toStrictEqual( input.description );
        expect( foundExtension?.version ).toStrictEqual( input.version );
        expect( foundExtension?.enabled ).toStrictEqual( input.enabled );

    });
    
});