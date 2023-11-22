import { ViterbiNode } from "kuromoji";
import { ExtractedTerms, GetTermsInput, TermExtractorAdapter } from "../../application/adapters/term_extractor.adapter";
import * as kuromoji from 'kuromoji';
import * as wanakana from 'wanakana';
import { join } from "path";
import { ROOT_DIR } from "../../../util/directories";
import isDev from "electron-is-dev";

const dicPath = isDev ?
    'node_modules/kuromoji/dict' :
    join( ROOT_DIR, '/node_modules/kuromoji/dict');

console.log({dicPath})

// Basic term extractor for development purposes
export class KuromojiTermExtractor implements TermExtractorAdapter {

    tokenizer: kuromoji.Tokenizer< kuromoji.IpadicFeatures >;

    constructor() {
        this.init();
    }

    async init(): Promise< void > {

        if ( !this.tokenizer )
            this.tokenizer = await this.getTokenizer();
    }
    
    private getTokenizer(): Promise< kuromoji.Tokenizer< kuromoji.IpadicFeatures > > {
        return new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>( (resolve, reject) => {
            kuromoji.builder({
                dicPath
            }).build((err, tokenizer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(tokenizer);
                }
            });
        });
    }

    getTerms( input: GetTermsInput ): ExtractedTerms {

        const { text } = input;

        if ( !this.tokenizer )  {
            while ( !this.tokenizer ) {}
        }

        const filter = ( term: string ) => {
            return !term.includes('。')
        };        

        const tokens = this.tokenizer.tokenize( text );
        
        const standard: string[] = tokens.map( this.handleTokenForm )
            .filter( filter );
            
        const hasKatakana = tokens.some( token => 
            wanakana.isKatakana( token.surface_form )
        );
                
        let kanaNormalized: string[] | undefined;
        if ( hasKatakana ) {
            kanaNormalized = this.tokenizer.tokenize( wanakana.toHiragana( text ) )
                .map( this.handleTokenForm )
                .filter( filter );
        }

        return {
            standard,
            kanaNormalized
        };
    }

    async getTermsAsync( input: GetTermsInput ): Promise< ExtractedTerms > {
        return this.getTerms( input );
    }

    private handleTokenForm( token: kuromoji.IpadicFeatures ): string {
        return token.basic_form != '*' ? token.basic_form : token.surface_form;
    }
    
}

export interface ViterbiLatticeExtended extends kuromoji.ViterbiLattice {
    nodes_end_at: ViterbiNode[][];
    eos_pos: number;
}