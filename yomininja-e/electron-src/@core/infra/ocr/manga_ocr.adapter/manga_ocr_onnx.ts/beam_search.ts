import { InferenceSession, Tensor, TypedTensor } from 'onnxruntime-node';
import { TokenSequence, Token } from './token_sequence';
import lodash from 'lodash';
import { DecoderFeeds, getLogits, softmax, topKTokens } from './util';


type DecodingResult = {
    sequence: TokenSequence;
    nextFeeds?: DecoderFeeds;
}

export class BeamSearch {

    decoder: InferenceSession;
    vocab: string[];
    startTokenId: bigint;
    eosTokenId: bigint;
    maxSequenceLength: number;

    constructor( input: {
        decoder: InferenceSession;
        vocab: string[];
        maxSequenceLength: number;
        startTokenId: bigint;
        eosTokenId: bigint;
    } ) {
        this.decoder = input.decoder;
        this.vocab = input.vocab;
        this.maxSequenceLength = input.maxSequenceLength;
        this.startTokenId = input.startTokenId;
        this.eosTokenId = input.eosTokenId;
    }

    async generate( encoderLastHiddenStates: Tensor,  k = 4 ): Promise< string[] > {

        const initialTokens: Token[] = [];

        const initialIds = [ this.startTokenId ];

        const inputIds = new Tensor(
            "int64",
            new BigInt64Array(initialIds),
            [ 1, initialIds.length ]
        );

        const initialFeeds = {
            input_ids: inputIds, 
            encoder_hidden_states: encoderLastHiddenStates
        };

        initialFeeds.input_ids.data.forEach(
            id => initialTokens.push({
                id,
                score: 100
            })
        );

        const sequence = new TokenSequence({
            sequence: initialTokens,
            maxSequenceLength: this.maxSequenceLength
        });
   
        let stop = false;

        let finalSequences: TokenSequence[] = [];

        let topSequences = await this.decode(
            sequence,
            initialFeeds,
            k
        );

        while ( !stop ) {

            let stepResults: TokenSequence[] = [];

            for ( const sequence of topSequences ) {

                if ( sequence.eosReached ) {
                    finalSequences.push( sequence );
                    continue;
                }

                if ( sequence.nextDecoderFeeds ) {
                    stepResults = [
                        ...stepResults,
                        ...( await this.decode( sequence, sequence.nextDecoderFeeds, k ) )
                    ]
                }
            
                // console.log({
                //     sequenceIds: result.sequence.ids,
                //     generatedText: result.sequence.toText( this.vocab )
                // });


                // generatedText = result.sequence.toText( this.vocab );
            }

            if ( finalSequences.length >= k ) break;
            
            topSequences = this.getTopSequences( stepResults, k );

        }

        const bestSequences: TokenSequence[] = this.getTopSequences( topSequences, k );
        
        return bestSequences.map( sequence => sequence.toText( this.vocab ) +' '+sequence.getScore()  );
    }

    private async decode(
        sequence: TokenSequence,
        feeds: DecoderFeeds,
        k: number
    ): Promise< TokenSequence[] > {

        const inferenceResult = await this.decoder.run( feeds );

        const sequences = this.extendSequence({
            sequence,
            logitsTensor: inferenceResult.logits,
            k
        });

        const decodingResults: TokenSequence[] = [];

        for ( const sequence of sequences )  {

            let nextFeeds: DecoderFeeds | undefined;

            if ( !sequence.eosReached ) {
                
                nextFeeds = {
                    input_ids: sequence.tensor,
                    encoder_hidden_states: feeds.encoder_hidden_states
                }
                
                sequence.nextDecoderFeeds = nextFeeds;
            }

            decodingResults.push(sequence);
        }

        return decodingResults
    }

    extendSequence(
        input: {
            sequence: TokenSequence;
            logitsTensor: Tensor;
            k: number;
        }
    ): TokenSequence[] {

        const { sequence, logitsTensor, k } = input;

        const nextLogits = this.getLastLogits( logitsTensor, this.vocab.length - 1 );

        const sequences: TokenSequence[] = [ sequence ];
        
        // cloning sequence
        for ( let i=1; i < k; i++ ) {
            sequences.push( sequence.clone() );
        }

        topKTokens( nextLogits, k )
            .map( ( token, idx ) => {
                sequences[ idx ]?.addToken( token );
            });

        return sequences;
    }

    getTopSequences( sequences: TokenSequence[], k: number ): TokenSequence[] {
        return sequences.sort( ( a, b ) => b.getScore() - a.getScore() )
            .slice( 0, k );
    }

    getLastLogits( logitsTensor: Tensor, logitsLength: number ): number[] {

        const logitsFlatArray = Array.prototype.slice.call( logitsTensor.data );

        const lastLogits = logitsFlatArray.slice(
            logitsFlatArray.length - logitsLength
        );

        return softmax(lastLogits);
    }
}