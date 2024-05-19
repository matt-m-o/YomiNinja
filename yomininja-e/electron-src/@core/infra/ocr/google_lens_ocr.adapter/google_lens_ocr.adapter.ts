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
import vm from 'vm';
import { session } from "electron";

export class GoogleLensOcrAdapter implements OcrAdapter< GoogleLensOcrEngineSettings > {

    static _name: string = googleLensOcrAdapterName;
    public readonly name: string = GoogleLensOcrAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;
    private cookie: string = '';

    private prevImage: Buffer = Buffer.from('');
    private prevResult: OcrResultScalable | null = null;
    private prevResultTime: Date = new Date();


    constructor() {}

    initialize( _?: string | undefined ) {}

    async recognize( input: OcrRecognitionInput ): Promise< OcrResultScalable | null > {

        this.idCounter++;

        const isCacheValid = this.isCacheValid( input.imageBuffer );
        // console.log({ [`${this.name}_IsCacheValid`]: isCacheValid });
        if ( isCacheValid )
            return this.prevResult;
        else
            this.prevImage = input.imageBuffer;

        const imageBuffer = await this.rescaleImage( input.imageBuffer );

        const imageMetadata = await sharp( imageBuffer ).metadata();

        // console.log({
        //     imageWidth: imageMetadata.width,
        //     imageHeight: imageMetadata.height
        // });

        const data = await this.sendRequest( imageBuffer );

        if ( !data ) {
            this.cacheResult( null );
            return null;
        }

        const contextResolution: OcrResultContextResolution  = {
            width: imageMetadata?.width || 0,
            height: imageMetadata?.height || 0
        };

        const ocrResultItems: OcrItemScalable[] = this.handleOcrData(
            data, contextResolution
        );
        // console.log( ocrResultItems );

       

        const result = OcrResultScalable.create({
            id: this.idCounter.toString() + this.name,
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

        this.cacheResult( result );

        return result;
    }

    async getCookie(): Promise< string > {

        if ( this.cookie.includes('SOCS') )
            return this.cookie;

        const { defaultSession } = session;

        const allCookies = await defaultSession.cookies.get({
            domain: '.google.com'
        });

        if ( allCookies.length === 0 ) return '';

        const aec = allCookies.find( c => c.name.toUpperCase() === 'AEC' );
        const __secure_enid = allCookies.find( c => c.name.toUpperCase() === '__SECURE-ENID' );
        const nid = allCookies.find( c => c.name.toUpperCase() === 'NID' );
        const consent = allCookies.find( c => c.name.toUpperCase() === 'CONSENT' );
        const socs = allCookies.find( c => c.name.toUpperCase() === 'SOCS' );

        const necessaryCookies = nid ?
            [ aec, consent, socs, nid ] : // Accept
            [ aec, __secure_enid, consent, socs ]; // Reject    
            
        this.cookie = necessaryCookies.map( cookie => {
                if ( !cookie ) return;
                return `${cookie.name}=${cookie.value}`;
            })
            .filter(Boolean)
            .join('; ')
            .trim();

        return this.cookie;
    }

    removeCookies() {
        this.cookie = '';
    }

    async sendRequest( image: Buffer ): Promise< any[] | undefined > {

        const cookie = await this.getCookie();

        const data = new FormData();

        data.append( 'encoded_image', image, { filename: 'image.png' } );

        const stcs = Date.now().toString().slice(0, 10);

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://lens.google.com/v3/upload?stcs=${stcs}`,
            headers: { 
                ...data.getHeaders(),
                'User-Agent': session.defaultSession.getUserAgent(),
                'Origin': 'https://lens.google.com',
                'Referer': 'https://lens.google.com/',
                'Host': 'lens.google.com',
                'Cookie': cookie,
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'
            },
            data
        };

        try {

            const response = await axios.request(config);

            if ( !response?.data ) return;

            // fs.writeFileSync( './data/google_lens_response_data', response.data );

            const codeBlockPattern = /AF_initDataCallback\({key: 'ds:1',([\s\S]*?)\}\)/;
            const codeBlockMatchResult = response.data.match(codeBlockPattern);

            if ( codeBlockMatchResult?.[1] ) {

                const extractedContent = `{${codeBlockMatchResult[1]}}`;
                // fs.writeFileSync('./data/extractedContent.json', extractedContent);

                const context = vm.createContext({});
                const extractedJson = vm.runInContext(`(${extractedContent})`, context);
                const data = extractedJson.data;

                // Debugging 
                // fs.writeFileSync('./data/google_lens_result.json', JSON.stringify(extractedJson));
                
                return data;

            } else {
                console.log('No match found.');
            }

        } catch (error) {
            console.log(error);
        }
        
    }

    handleOcrData( data: any[], contextResolution: OcrResultContextResolution ): OcrItemScalable[] {
        
        let firstIdx = 2;

        for( let i=firstIdx; i < data[2][3][0].length; i++ ) {

            if ( !Boolean( data[2][3][0][ i ]?.[2] ) ) continue;

            firstIdx = i;
            break;
        }

        // console.log({ firstIdx })

        const blocksDataArr = data[2][3][0].slice( firstIdx );

        const blocks: OcrItemScalable[] = blocksDataArr.map( ( blockData: any[] ) => {

            let blockIsVertical = false;

            // TypeError: Cannot read properties of null (reading '3') | image: Rain Code Cloud Vision Multiline.png
            const blockLines: OcrTextLineScalable[] = blockData[2]?.[0][5]?.[3][0]?.map( ( lineData: any[] ) => {
                
                const lineTextData = lineData[0];
                const lineBoxData = lineData[1];

                const text: string = lineTextData.map( ( word: any[] ) => word[0] + ( word[3] || '' )  ).join('');

                // console.log( lineTextData );
                // console.log( lineBoxData );
                // console.log(text)

                const widthPx = contextResolution.width * lineBoxData[2];
                const heightPx = contextResolution.height * lineBoxData[3];

                const isVertical = (
                    heightPx > ( widthPx * 1.20 ) &&
                    text?.length > 1
                );

                blockIsVertical =  blockIsVertical || isVertical;

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
                    isVertical,
                    transform_origin: 'center'
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

            // if ( blockIsVertical ) blockLines.reverse();

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
                    isVertical: blockIsVertical,
                    angle_degrees: blockBoxData[5],
                    transform_origin: 'center',
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

    async rescaleImage( image: Buffer, maxPixelCount = 2_764_800 ): Promise< Buffer > {
        // 2_764_800 is equivalent to 1080p (21:9)

        const sharpImage = sharp(image);

        const { width, height } = await sharpImage.metadata();

        // console.log({ width, height });

        if ( !width || !height )
            return image;

        const pixelCount = width * height;
        
        if ( pixelCount < maxPixelCount )
            return image;

        const newWidth = Math.floor(
            Math.sqrt( ( maxPixelCount * width ) / height )
        );

        const newHeight = Math.floor(
            Math.sqrt( ( maxPixelCount * height) / width )
        );

        console.log({ newWidth, newHeight });
        
        return await sharpImage.resize({
            width: newWidth,
            height: newHeight
        }).toBuffer();
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

    private cacheResult( result: OcrResultScalable | null ) {
        this.prevResult = result;
        this.prevResultTime = new Date();
    }

    private getCacheAge(): number { // seconds
        return ( Date.now() - this.prevResultTime.getTime() ) / 1000;
    }

    private isCacheValid( image: Buffer ): boolean {

        if ( this.getCacheAge() > 30 )
            return false;

        const isSameImage = this.prevImage.equals( image );

        if ( !isSameImage ) return false;

        return true;
    }

}