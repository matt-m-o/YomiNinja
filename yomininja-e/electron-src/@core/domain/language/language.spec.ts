import { cloneDeep } from 'lodash';
import { Language, Language_CreationInput } from './language';



describe( "Language tests", () => {

    it( "should define a language", () => {

        const props: Language_CreationInput = {
            name: 'japanese',
            two_letter_code: 'ja',
        }

        const language = Language.create(props);

        expect( language.id ).toBeDefined();
        expect( language.name ).toStrictEqual( props.name );
        expect( language.two_letter_code ).toStrictEqual( props.two_letter_code );
    });
    
});