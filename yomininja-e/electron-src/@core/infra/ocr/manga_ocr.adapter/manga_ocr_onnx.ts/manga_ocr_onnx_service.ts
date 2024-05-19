import { InferenceSession, Tensor } from "onnxruntime-node";
import { MangaOcrService, MangaOcrRecognize_Input } from "../manga_ocr_service";
import { BeamSearch } from "./beam_search";
import { readFileSync } from "fs";
import * as Jimp from 'jimp';
import { OcrItemBox, OcrResult } from "../../../../domain/ocr_result/ocr_result";


export class MangaOcrOnnxService implements MangaOcrService {

    private vocab: string[];
    private encoder: InferenceSession;
    private decoder: InferenceSession;
    private sessionOptions: InferenceSession.SessionOptions;
    private maxTokenSequenceLength: number = 300;
    private encoderInputShape: number[] = [ 1, 3, 224, 224 ];
    private startTokenId: bigint = 2n;
    private eosTokenId: bigint = 3n;
    private beamSearch: BeamSearch;
    private numBeams = 4;


    async init() {
        this.encoder = await InferenceSession.create(
            './data/manga_ocr/encoder_model.onnx',
            this.sessionOptions
        );

        this.decoder = await InferenceSession.create(
            './data/manga_ocr/decoder_model.onnx',
            this.sessionOptions
        );

        const rawVocab = readFileSync( './data/manga_ocr/vocab.txt', 'utf-8' );
        this.vocab = rawVocab.split("\n");

        this.beamSearch = new BeamSearch({
            decoder: this.decoder,
            maxSequenceLength: this.maxTokenSequenceLength,
            vocab: this.vocab,
            startTokenId: this.startTokenId,
            eosTokenId: this.eosTokenId,
        });
    }

    async recognize( input: MangaOcrRecognize_Input ): Promise< OcrResult > {

        const jimpImage = await Jimp.read( input.image );

        const result = OcrResult.create({
            id: input.id,
            context_resolution: {
                height: (await jimpImage).getHeight(),
                width: (await jimpImage).getWidth(),
            },
        });

        // TODO: Detect text
        const boxes: OcrItemBox[] = input.boxes || [];

        for ( const box of boxes ) {

            const textImage = await this.crop( jimpImage, box );

            const hypotheses = await this._recognize( textImage );
            result.addResultItem({
                box,
                classification_label: 1,
                classification_score: 1,
                recognition_score: 1,
                text: [
                    {
                        content: hypotheses?.[0] || ''
                    }
                ]
            });
        }

        return result;
    }

    private async crop( image: Jimp, box: OcrItemBox ): Promise<Buffer> {
        // TODO: Crop
        return image.bitmap.data;
    }

    
    private async _recognize( image: Buffer, numBeams?: number) {
        
        const encoderResults = await this.encode( image );
        
        // return [(await this.greedySearch.generate( initialFeeds ))];
        return await this.beamSearch.generate(
            encoderResults.last_hidden_state,
            numBeams || this.numBeams
        );
    }

    private async imageToTensor( image: Buffer ): Promise< Tensor > {

        const [ _, nChannels, width, height ] = this.encoderInputShape;

        const imageData = ( await Jimp.default.read( image ) )
            .resize( width, height )
            .bitmap.data;

        const [ redArray, greenArray, blueArray ] = new Array(
            new Array<number>(),
            new Array<number>(),
            new Array<number>(),
            // new Array<number>(),
        );

        // Extract the R, G, and B channels
        for ( let i = 0; i < imageData.length; i += 4 ) {
            redArray.push( imageData[i] );
            greenArray.push( imageData[i + 1] );
            blueArray.push( imageData[i + 2] );
            // alphaArray.push( imageBufferData[i + 3] ) // skip to filter out the alpha channel
        }

        // Transpose
        const transposedData = redArray.concat(greenArray).concat(blueArray); // RGB
        // const transposedData = blueArray.concat(greenArray).concat(redArray); // BGR


        const float32Data = new Float32Array( nChannels * width * height );
        for ( let i = 0; i < transposedData.length; i++) {
            float32Data[i] = ( 2 * (transposedData[i] / 255.0 ) ) - 1; // convert 
        }

        return new Tensor( "float32", float32Data, this.encoderInputShape );
    }

    async encode( image: Buffer ): Promise< InferenceSession.OnnxValueMapType > {

        const pixel_values = await this.imageToTensor( image );

        return await this.encoder.run({ pixel_values });
    }
}