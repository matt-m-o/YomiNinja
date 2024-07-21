import lodash from "lodash";
import { Token } from "./token_sequence";
import { Tensor, TypedTensor } from "onnxruntime-node";


export type DecoderFeeds = {
    input_ids: TypedTensor<"int64">;
    encoder_hidden_states: Tensor;
}

export function getLogits( logitsTensor: Tensor, logitsLength: number ): number[][] {

    const logitsFlatArray = Array.prototype.slice.call( logitsTensor.data );

    const logitsArray = [];

    const maxIdx = logitsLength - 0;

    for ( let i = 0; i < logitsFlatArray.length; i += maxIdx ) {
        const logit = logitsFlatArray.slice( i, i + maxIdx );
        logitsArray.push(
            softmax(logit)
        );
    }

    return logitsArray;
}

export function getNextLogits( logitsTensor: Tensor, logitsLength: number ): number[][] {

    const logitsFlatArray = Array.prototype.slice.call( logitsTensor.data );

    const nextLogit = logitsFlatArray.slice(
        logitsFlatArray.length - logitsLength
    );

    return [ softmax( nextLogit ) ];
}

export function topKTokens( logits: any, k: number ): Token[] {

    const probabilities = lodash.isTypedArray( logits ) ?
        Array.prototype.slice.call(logits) :
        logits;

    const sorted = lodash.reverse(
        lodash.sortBy(
            probabilities.map(
                ( prob: any, index: number ) => [ prob, index ]
            ),
            ( probIndex: Array<number> ) => probIndex[0]
        )
    );

    return lodash.take( sorted, k )
        .map( ( probIndex: Array<number> ) => {

            const token: Token = {
                id: BigInt(
                    parseInt( probIndex[1].toString(), 10 )
                ),
                score: probIndex[0]
            };

            return token;
        });
}

export function softmax( array: number[] ): number[] {

    const largestNumber = Math.max(...array);

    const sumOfExp = array.map( ( resultItem ) =>
            Math.exp( resultItem - largestNumber )
        )
        .reduce( ( prevNumber, currentNumber ) => prevNumber + currentNumber );

    // Normalization.
    return array.map( ( resultValue ) => {
        return Math.exp( resultValue - largestNumber ) / sumOfExp;
    });
}