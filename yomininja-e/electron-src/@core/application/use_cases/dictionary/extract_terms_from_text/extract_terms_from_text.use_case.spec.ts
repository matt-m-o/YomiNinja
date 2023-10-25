import { Language } from "../../../../domain/language/language";
import { KuromojiTermExtractor } from "../../../../infra/kuromoji_term_extractor.adapter/kuromoji_term_extractor.adapter";
import { TermExtractorAdapter } from "../../../adapters/term_extractor.adapter";
import { ExtractTermsFromTextUseCase, ExtractTermsFromText_Input } from "./extract_terms_from_text.use_case";



describe('ExtractTermsFromTextUseCase tests', () => {

    let useCase: ExtractTermsFromTextUseCase;

    let termExtractor = new KuromojiTermExtractor();

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

        const output = await useCase.execute( input );

        expect( output ).toHaveLength( 3 );
    });
    
});