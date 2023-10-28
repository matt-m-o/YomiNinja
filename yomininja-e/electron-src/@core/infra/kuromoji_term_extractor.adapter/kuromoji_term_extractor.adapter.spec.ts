import { KuromojiTermExtractor, ViterbiLatticeExtended } from "./kuromoji_term_extractor.adapter";


describe('KuromojiTermExtractor adaptor tests', () => {

    const termExtractor = new KuromojiTermExtractor();

    beforeAll( async () => {

        if ( !termExtractor?.tokenizer )
            await termExtractor.init();
    });

    it('should extract the terms of a simple Japanese text', () => {

        const text = '外国人です';

        const terms = termExtractor.getTerms({ text });        

        expect( terms.length === 3 ).toBeTruthy();
        expect( terms[0] ).toStrictEqual('外国');
        expect( terms[1] ).toStrictEqual('人');
        expect( terms[2] ).toStrictEqual('です');
    });
    
    it('should extract the terms of a Japanese text with verbs', () => {

        const text = '傘を忘れました。';

        const terms = termExtractor.getTerms({ text });

        expect( terms.length === 5 ).toBeTruthy();
        expect( terms[0] ).toStrictEqual( '傘' );
        expect( terms[1] ).toStrictEqual( 'を' );
        expect( terms[2] ).toStrictEqual( '忘れる' );
        expect( terms[3] ).toStrictEqual( 'ます' );
        expect( terms[4] ).toStrictEqual( 'た' );
    });
});