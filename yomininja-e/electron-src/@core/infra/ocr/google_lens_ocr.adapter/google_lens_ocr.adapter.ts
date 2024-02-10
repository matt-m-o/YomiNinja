import { google } from "@google-cloud/vision/build/protos/protos";
import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { OcrItem, OcrItemBox, OcrItemBoxVertex, OcrResult, OcrResultContextResolution, OcrTextLine } from "../../../domain/ocr_result/ocr_result";
import { googleLensOcrAdapterName, GoogleLensOcrEngineSettings, getGoogleLensDefaultSettings } from "./google_lens_ocr_settings";
import { OcrEngineSettingsU } from "../../types/entity_instance.types";
import FormData from 'form-data';
import axios from 'axios';
import { OcrItemScalable, OcrResultBoxScalable, OcrResultScalable, OcrTextLineScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import sharp from "sharp";
import fs from 'fs';

export class GoogleLensOcrAdapter implements OcrAdapter< GoogleLensOcrEngineSettings > {

    static _name: string = googleLensOcrAdapterName;
    public readonly name: string = GoogleLensOcrAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;

    constructor() {}

    initialize( _?: string | undefined ) {}

    async recognize( input: OcrRecognitionInput ): Promise< OcrResultScalable | null > {

        const { imageBuffer, languageCode } = input;

        const data = await this.sendRequest( imageBuffer );

        if ( !data ) return null;

        const ocrResultItems: OcrItemScalable[] = this.handleOcrData( data );
        console.log( ocrResultItems );

        const imageMetadata = await sharp( imageBuffer ).metadata();

        const contextResolution: OcrResultContextResolution  = {
            width: imageMetadata?.width || 0,
            height: imageMetadata?.height || 0
        };

        const result = OcrResultScalable.create({
            id: this.idCounter,
            context_resolution: contextResolution,
            ocr_regions: [
                {
                    position: {
                        top: 0,
                        left: 0,
                    },
                    size: {
                        width: 1,
                        height: 1
                    },
                    results: ocrResultItems
                }
            ]
        });

        return result;
    }

    async sendRequest( image: Buffer ): Promise< any[] | undefined > {

        const data = new FormData();

        data.append( 'encoded_image', image, { filename: 'image.png' } );

        const stcs = Date.now().toString().slice(0, 10);

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://lens.google.com/v3/upload?stcs=${stcs}`,
            headers: { 
                ...data.getHeaders()
            },
            data
        };

        const response = await axios.request(config)
            .catch( ( error: any ) => {
                console.log(error);
            });

        if ( !response?.data ) return;

        const codeBlockPattern = /AF_initDataCallback\({key: 'ds:1',([\s\S]*?)\}\)/;
        const codeBlockMatchResult = response.data.match(codeBlockPattern);
        
        const dataPattern = /\(([^)]+)\)/;
        const dataMatchResult = codeBlockMatchResult[0].match( dataPattern );

        if ( dataMatchResult ) {
            const extractedContent = dataMatchResult[1];

            const fixedJsonString = `${extractedContent}`
                .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
                .replaceAll("'", '"');

            const extractedJson = JSON.parse(fixedJsonString);
            const data = extractedJson.data;

            // Debugging 
            fs.writeFileSync('./data/google_lens_result.json', JSON.stringify(extractedJson));
            
            return data;

        } else {
            console.log('No match found.');
        }
    }

    handleOcrData( data: any[] ): OcrItemScalable[] {
        
        let firstIdx = 2;

        for( let i=firstIdx; i < data[2][3][0].length; i++ ) {

            if ( !Boolean( data[2][3][0][ i ]?.[2] ) ) continue;

            firstIdx = i;
            break;
        }

        // console.log({ firstIdx })

        const blocksDataArr = data[2][3][0].slice( firstIdx );

        // if ( isSingleLinesOnly )
        //     blocksDataArr = data[2][3][0].slice( 3 );
        // else
        //     blocksDataArr = data[2][3][0].slice( 4 );

        const blocks: OcrItemScalable[] = blocksDataArr.map( ( blockData: any[] ) => {

            // TypeError: Cannot read properties of null (reading '3') | image: Rain Code Cloud Vision Multiline.png
            const blockLines: OcrTextLineScalable[] = blockData[2]?.[0][5]?.[3][0]?.map( ( lineData: any[] ) => {
                
                const lineTextData = lineData[0];
                const lineBoxData = lineData[1];

                const text = lineTextData.map( ( word: any[] ) => word[0] + ( word[3] || '' )  ).join('');

                // console.log( lineTextData );
                // console.log( lineBoxData );
                // console.log(text)

                const box: OcrResultBoxScalable = {
                    position: {
                        top: lineBoxData[0] * 100,
                        left: lineBoxData[1] * 100,
                    },
                    dimensions: {
                        width: lineBoxData[2] * 100,
                        height: lineBoxData[3] * 100
                    },
                    angle_degrees: lineBoxData[5],
                    isVertical: false, // lineBoxData[4] ?
                };
            
                const line: OcrTextLineScalable = {
                    content: text,
                    box,
                };

                // console.log( line );

                return line;
            });

            const blockBoxData = blockData[2]?.[0][5]?.[3][1];

            if ( !blockBoxData ) return;

            const block: OcrItemScalable = {
                text: blockLines,
                box: {
                    position: {
                        top: blockBoxData[0] * 100,
                        left: blockBoxData[1] * 100,
                    },
                    dimensions: {
                        width: blockBoxData[2] * 100,
                        height: blockBoxData[3] * 100,
                    },
                    isVertical: false,
                    angle_degrees: blockBoxData[5],
                },
                classification_label: 0,
                classification_score: 1,
                recognition_score: 1
            };

            // console.log( block.box )

            return block;

        }).filter( ( block: OcrItemScalable | undefined ) => Boolean(block) );

        return blocks;
    }

    async getSupportedLanguages(): Promise< string[] > {
        return [];
    }

    async updateSettings(
        settingsUpdate: OcrEngineSettingsU,
        oldSettings?: OcrEngineSettingsU | undefined
    ): Promise< UpdateOcrAdapterSettingsOutput< GoogleLensOcrEngineSettings > > {

        // TODO: Settings validation

        settingsUpdate = settingsUpdate as GoogleLensOcrEngineSettings;
        oldSettings = settingsUpdate as GoogleLensOcrEngineSettings;

        return {
            restart: false,
            settings: settingsUpdate
        }
    }

    getDefaultSettings(): GoogleLensOcrEngineSettings {
        return getGoogleLensDefaultSettings();
    }

    getSettingsOptions: () => OcrEngineSettingsOptions;

    restart = async ( callback: () => void ) => {
        callback();
    };

}