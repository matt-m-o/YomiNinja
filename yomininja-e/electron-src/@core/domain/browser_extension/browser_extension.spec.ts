import { cloneDeep } from 'lodash';
import { BrowserExtension, BrowserExtension_CreationInput } from './browser_extension';



describe( "BrowserExtension tests", () => {

    it( "should define a BrowserExtension", () => {

        const props: BrowserExtension_CreationInput = {
            id: 'asdf',
            name: 'x',
            version: '1.0.0',
            description: 'some extension',
            icon: Buffer.from(''),
            optionsUrl: ''
        };

        const extension = BrowserExtension.create(props);

        expect( extension.id ).toStrictEqual( props.id );
        expect( extension.name ).toStrictEqual( props.name );
        expect( extension.description ).toStrictEqual( props.description );
        expect( extension.version ).toStrictEqual( props.version );
        expect( extension.icon ).toStrictEqual( props.icon );
        expect( extension.optionsUrl ).toStrictEqual( props.optionsUrl );
        expect( extension.enabled ).toStrictEqual( true );
    });
    
});