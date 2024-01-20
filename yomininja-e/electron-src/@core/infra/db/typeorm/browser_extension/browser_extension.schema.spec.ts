import { DataSource, Repository } from 'typeorm';
import { Language } from '../../../../domain/language/language';
import { BrowserExtensionTypeOrmSchema } from './browser_extension.schema';
import { BrowserExtension } from '../../../../domain/browser_extension/browser_extension';



describe( 'BrowserExtension Entity Schema tests', () => {

    let dataSource: DataSource;
    let browserExtensionTypeOrmRepo: Repository< BrowserExtension >;

    beforeEach( async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                BrowserExtensionTypeOrmSchema
            ],
        });

        await dataSource.initialize();

        browserExtensionTypeOrmRepo = dataSource.getRepository( BrowserExtension );
    });

    it("should insert", async () => {

        const extension = BrowserExtension.create({
            id: 'asdf',
            name: 'x',
            version: '1.0.0',
            description: 'some extension',
            icon: Buffer.from('zxcv'),
            optionsUrl: ''
        });
        
        await browserExtensionTypeOrmRepo.save( extension );

        const foundExtension = await browserExtensionTypeOrmRepo.findOneBy({ id: extension.id });
        

        expect( foundExtension ).toBeDefined();
        expect( foundExtension ).toStrictEqual( extension );
        expect( foundExtension?.id ).toStrictEqual( extension.id );
        expect( foundExtension?.icon?.toString() ).toStrictEqual( 'zxcv' );
        expect( foundExtension?.enabled ).toStrictEqual( true );
    });

});