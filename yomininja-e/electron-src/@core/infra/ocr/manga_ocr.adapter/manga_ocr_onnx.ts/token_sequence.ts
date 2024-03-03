import { Tensor, TypedTensor } from "onnxruntime-node";
import { DecoderFeeds } from "./util";
import lodash from 'lodash';

export type Token = {
    id: bigint; // Vocab index
    score: number;
}

export class TokenSequence {

    tokens: Token[] = [];
    eosReached: boolean = false;
    nextDecoderFeeds: DecoderFeeds;
    maxSequenceLength: number = 300;
    eosTokenId: bigint = 3n;

    constructor(
        input?: {
            sequence?: Token[];
            maxSequenceLength?: number;
            eosTokenId?: bigint;
        }
    ) {

        if ( !input ) return;

        if ( input.sequence )
            this.tokens = lodash.cloneDeep(input.sequence);

        if ( input.maxSequenceLength )
            this.maxSequenceLength = input.maxSequenceLength;

        if ( input.eosTokenId !== undefined )
            this.eosTokenId = input.eosTokenId;
    }
    
    get lastToken(): Token {
        return this.tokens[ this.tokens.length - 1 ];
    }

    get length(): number {
        return this.tokens.length;
    }

    get ids(): bigint[] {
        return this.tokens.map( token => BigInt(token.id) );
    }

    get tensor(): TypedTensor<"int64"> {
        return new Tensor( "int64", this.ids, [ 1, this.tokens.length ] )
    }

    addToken( token: Token ) {
        this.tokens.push( token );
        this.eosCheck();
    }

    getScore( lengthPenalty = 2 ): number { // 0.75

        const logProbSum = this.tokens.reduce(
            ( sum, token ) => (
                sum + Math.log( token.score )
            ),
            0
        );
      
        const normalizedScore = logProbSum / Math.pow( this.tokens.length, lengthPenalty );
    
        return normalizedScore;
    }

    toText( vocab: string[], minIdx = 15 ): string {
        return this.tokens.filter( token => token.id >= minIdx )
            .map( token => vocab[ Number(token.id) ] )
            .join('')
    }

    eosCheck() {
        if (
            this.lastToken.id === this.eosTokenId ||
            this.tokens.length >= this.maxSequenceLength
        ) {
            this.eosReached = true;
        }
    }

    clone(): TokenSequence {
        return new TokenSequence({
            sequence: lodash.cloneDeep( this.tokens ),
            maxSequenceLength: this.maxSequenceLength
        });
    }
}