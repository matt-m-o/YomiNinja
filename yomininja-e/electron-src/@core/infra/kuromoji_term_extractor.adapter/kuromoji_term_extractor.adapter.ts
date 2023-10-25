import { ViterbiNode } from "kuromoji";
import { GetTermsInput, TermExtractorAdapter } from "../../application/adapters/term_extractor.adapter";
import * as kuromoji from 'kuromoji';


// Basic term extractor for development purposes
export class KuromojiTermExtractor implements TermExtractorAdapter {

    tokenizer: kuromoji.Tokenizer< kuromoji.IpadicFeatures >;    

    async init(): Promise< void > {
        this.tokenizer = await this.getTokenizer();
    }

    private getTokenizer(): Promise< kuromoji.Tokenizer< kuromoji.IpadicFeatures > > {
        return new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>( (resolve, reject) => {
            kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err, tokenizer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(tokenizer);
                }
            });
        });
    }

    getTerms( input: GetTermsInput ): string[] {

        const { text } = input;        

        const tokens = this.tokenizer.tokenize( text );        
        
        const terms: string[] = tokens.map( token => token.basic_form )
            .filter( term => {
                return !term.includes('。')
            });

        return terms;
    }

    async getTermsAsync( input: GetTermsInput ): Promise< string[] > {
        return this.getTerms( input );
    }    
    
}

export interface ViterbiLatticeExtended extends kuromoji.ViterbiLattice {
    nodes_end_at: ViterbiNode[][];
    eos_pos: number;
}