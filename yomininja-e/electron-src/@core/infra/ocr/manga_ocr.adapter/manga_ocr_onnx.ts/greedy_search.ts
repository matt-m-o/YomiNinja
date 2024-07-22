import { InferenceSession, Tensor, TypedTensor } from 'onnxruntime-node';
import { TokenSequence, Token } from './token_sequence';
import lodash from 'lodash';
import { getLogits, topKTokens } from './util';

export type DecoderFeeds = {
    input_ids: TypedTensor<"int64">;
    encoder_hidden_states: Tensor;
}

export class GreedySearch {

    decoder: InferenceSession;
    vocab: string[];
    startTokenId: bigint;
    eosTokenId: bigint;
    maxSequenceLength: number;

    constructor(
        input: {
            decoder: InferenceSession;
            vocab: string[];
            maxSequenceLength: number;
        }
    ) {
        this.decoder = input.decoder;
        this.vocab = input.vocab;
        this.maxSequenceLength = input.maxSequenceLength;
    }

    async generate( initialFeeds: DecoderFeeds ): Promise< string > {

        const initialTokens: Token[] = [];

        initialFeeds.input_ids.data.forEach(
            id => initialTokens.push({
                id: id,
                score: 100
            })
        );

        const sequence = new TokenSequence({
            sequence: initialTokens,
            maxSequenceLength: this.maxSequenceLength
        });

        const result = await this.decode( sequence, initialFeeds, true );

        const generatedText = result.sequence.toText( this.vocab );

        return generatedText;
    }

    private async decode( sequence: TokenSequence, feeds: DecoderFeeds, auto = false ): Promise<{
        sequence: TokenSequence;
        nextFeeds?: DecoderFeeds;
    }> {

        const inferenceResult = await this.decoder.run( feeds );

        const resultTokens = this.generateTokens( inferenceResult.logits );
        
        const nextToken = resultTokens[ resultTokens.length - 1 ];
        sequence.addToken( nextToken )

        let nextFeeds: DecoderFeeds | undefined;

        if ( !sequence.eosReached ) {

            nextFeeds = {
                input_ids: sequence.tensor,
                encoder_hidden_states: feeds.encoder_hidden_states
            }

            if ( auto && nextFeeds !== undefined )
                return await this.decode( sequence, nextFeeds, auto );
        }

        return {
            sequence,
            nextFeeds
        }
    }

    generateTokens( logitsTensor: Tensor ): Token[] {

        const logits = getLogits(
            logitsTensor,
            this.vocab.length - 1
        );

        return logits.map( logit => {
            return topKTokens( logit, 1 )[0];
        });
    }

}