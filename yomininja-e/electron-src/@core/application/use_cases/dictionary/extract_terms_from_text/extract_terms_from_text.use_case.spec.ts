import { Language } from "../../../../domain/language/language";
import { JapaneseHelper } from "../../../../infra/japanese_helper.adapter/japanese_helper.adapter";
import { KuromojiTermExtractor } from "../../../../infra/kuromoji_term_extractor.adapter/kuromoji_term_extractor.adapter";
import { JapaneseHelperAdapter } from "../../../adapters/japanese_helper.adapter";
import { TermExtractorAdapter } from "../../../adapters/term_extractor.adapter";
import { ExtractTermsFromTextUseCase, ExtractTermsFromText_Input } from "./extract_terms_from_text.use_case";



describe('ExtractTermsFromTextUseCase tests', () => {

    let useCase: ExtractTermsFromTextUseCase;

    let termExtractor = new KuromojiTermExtractor();
    let japaneseHelper: JapaneseHelperAdapter = new JapaneseHelper();

    const languageJa = Language.create({
        name: 'Japanese',
        two_letter_code: 'ja',
    });
    
    beforeEach( async () => {

        if ( !termExtractor?.tokenizer )
            await termExtractor.init();

        useCase = new ExtractTermsFromTextUseCase({
            termExtractor,
        });
        
    });


    it('should extract the terms of the Japanese text: 外国人です.', async () => {

        const input: ExtractTermsFromText_Input = {
            text: '外国人です',
            language: languageJa
        };

        const { standard } = await useCase.execute( input );

        expect( standard ).toHaveLength( 3 );
    });
    
    it('should extract the terms of the Japanese text: オマエやっといてくれ.', async () => {

        const input: ExtractTermsFromText_Input = {
            text: 'オマエやっといてくれ',
            language: languageJa
        };

        const { standard, kanaNormalized } = await useCase.execute( input );        

        expect( kanaNormalized ).toBeDefined();
        if ( !kanaNormalized ) return;

        expect( kanaNormalized ).toHaveLength( 5 );
        expect( kanaNormalized[0] ).toStrictEqual( 'おまえ' );
        expect( kanaNormalized[1] ).toStrictEqual( 'やる' );
        expect( kanaNormalized[2] ).toStrictEqual( 'とく' );
        expect( kanaNormalized[3] ).toStrictEqual( 'て' );
        expect( kanaNormalized[4] ).toStrictEqual( 'くれる' );
    });
});