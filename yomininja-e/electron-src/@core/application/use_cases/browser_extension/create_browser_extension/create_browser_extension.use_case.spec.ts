import { DataSource } from 'typeorm';
import { BrowserExtensionTypeOrmSchema } from '../../../../infra/db/typeorm/browser_extension/browser_extension.schema';
import { CreateBrowserExtensionUseCase, CreateBrowserExtension_Input } from './create_browser_extension.use_case';
import BrowserExtensionTypeOrmRepository from '../../../../infra/db/typeorm/browser_extension/browser_extension.typeorm.repository';
import { BrowserExtension } from '../../../../domain/browser_extension/browser_extension';


describe("BrowserExtensionUseCase tests", () => {    
        
    let useCase: CreateBrowserExtensionUseCase;

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

        useCase = new CreateBrowserExtensionUseCase({
            extensionsRepo
        });
        
    });

    it("should create a browser extension", async () => {        

        const input: CreateBrowserExtension_Input = {
            id: 'asdf',
            name: 'x',
            version: '1.0.0',
            enabled: true,
            description: ''
        };

        const output = await useCase.execute(input);
        
        const foundExtension = await extensionsRepo.findOne({
            id: input.id
        });

        expect( foundExtension ).toStrictEqual( output );

        expect( foundExtension?.id ).toStrictEqual( input.id );
        expect( foundExtension?.name ).toStrictEqual( input.name );
        expect( foundExtension?.version ).toStrictEqual( input.version );

    });
    
});