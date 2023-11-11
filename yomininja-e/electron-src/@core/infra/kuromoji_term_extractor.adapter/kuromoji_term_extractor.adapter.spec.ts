import { KuromojiTermExtractor, ViterbiLatticeExtended } from "./kuromoji_term_extractor.adapter";


describe('KuromojiTermExtractor adaptor tests', () => {

    const termExtractor = new KuromojiTermExtractor();

    beforeAll( async () => {

        if ( !termExtractor?.tokenizer )
            await termExtractor.init();
    });

    it('should extract the terms of a simple Japanese text', () => {

        const text = '外国人です';

        const { standard } = termExtractor.getTerms({ text });

        expect( standard.length === 3 ).toBeTruthy();
        expect( standard[0] ).toStrictEqual('外国');
        expect( standard[1] ).toStrictEqual('人');
        expect( standard[2] ).toStrictEqual('です');
    });
    
    it('should extract the terms of a Japanese text with verbs', () => {

        const text = '傘を忘れました。';

        const { standard } = termExtractor.getTerms({ text });

        expect( standard.length === 5 ).toBeTruthy();
        expect( standard[0] ).toStrictEqual( '傘' );
        expect( standard[1] ).toStrictEqual( 'を' );
        expect( standard[2] ).toStrictEqual( '忘れる' );
        expect( standard[3] ).toStrictEqual( 'ます' );
        expect( standard[4] ).toStrictEqual( 'た' );
    });


    it('should extract the terms of a Japanese text starting with katakana', () => {

        const text = 'オマエやっといてくれ';

        const {
            standard,
            kanaNormalized
        } = termExtractor.getTerms({ text });

        expect( standard.length === 5 ).toBeTruthy();
        expect( standard[0] ).toStrictEqual( 'オマエ' );
        expect( standard[1] ).toStrictEqual( 'やる' );
        expect( standard[2] ).toStrictEqual( 'とく' );
        expect( standard[3] ).toStrictEqual( 'て' );
        expect( standard[4] ).toStrictEqual( 'くれる' );

        expect( kanaNormalized ).toBeDefined();
        if ( !kanaNormalized ) return;

        expect( kanaNormalized.length === 5 ).toBeTruthy();
        expect( kanaNormalized[0] ).toStrictEqual( 'おまえ' );
    });

    it('should extract the terms of a Japanese text starting with a VERB in katakana', () => {

        const text = 'ワカッタ';

        const {
            standard,
            kanaNormalized
        } = termExtractor.getTerms({ text });

        // console.log( kanaNormalized )

        expect( kanaNormalized ).toBeDefined();
        if ( !kanaNormalized ) return;

        expect( kanaNormalized.length === 2 ).toBeTruthy();
        expect( kanaNormalized[0] ).toStrictEqual( 'わかる' );        
    });
});