import { OcrAdapter, OcrAdapterStatus, OcrEngineSettingsOptions, OcrRecognitionInput, TextRecognitionModel, UpdateOcrAdapterSettingsOutput } from "../../../application/adapters/ocr.adapter";
import { OcrItem, OcrItemBox, OcrItemBoxVertex, OcrResult, OcrResultContextResolution, OcrTextLine } from "../../../domain/ocr_result/ocr_result";
import { googleLensOcrAdapterName, GoogleLensOcrEngineSettings, getGoogleLensDefaultSettings } from "./google_lens_ocr_settings";
import { OcrEngineSettingsU } from "../../types/entity_instance.types";
import axios,{ AxiosRequestConfig } from 'axios';
import { OcrItemScalable, OcrResultBoxScalable, OcrResultScalable, OcrTextLineScalable, OcrTextWordScalable } from "../../../domain/ocr_result_scalable/ocr_result_scalable";
import sharp from "sharp";
import { session } from "electron";
import { lens } from '../../../../../grpc/rpc/lens/lens_pb';
import crypto from 'crypto'


export class GoogleLensOcrGrpcAdapter implements OcrAdapter< GoogleLensOcrEngineSettings > {

    static _name: string = googleLensOcrAdapterName;
    public readonly name: string = GoogleLensOcrGrpcAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private idCounter: number = 0;
    private cookie: string = '';
    private apiKey: string = '';

    private prevImage: Buffer = Buffer.from('');
    private prevResult: OcrResultScalable | null = null;
    private prevResultTime: Date = new Date();


    constructor() {
        this.status = OcrAdapterStatus.Enabled;
    }

    initialize( _?: string | undefined ) {}

    async recognize( input: OcrRecognitionInput ): Promise< OcrResultScalable | null > {

        this.idCounter++;

        const isCacheValid = this.isCacheValid( input.imageBuffer );
        // console.log({ [`${this.name}_IsCacheValid`]: isCacheValid });
        if ( isCacheValid )
            return this.prevResult;
        else
            this.prevImage = input.imageBuffer;

        const imageBuffer = await this.rescaleImage(
            input.imageBuffer,
            // 4_000_000,
            // 2000
        );

        const imageMetadata = await sharp( imageBuffer ).metadata();

        // console.log({
        //     imageWidth: imageMetadata.width,
        //     imageHeight: imageMetadata.height
        // });

        console.log();
        console.time("Google Lens request time");
        const data = await this.sendRequest( imageBuffer );
        console.timeEnd("Google Lens request time");
        console.log();

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
                    id: '0',
                    position: {
                        top: 0,
                        left: 0,
                    },
                    size: {
                        width: 1,
                        height: 1
                    },
                    results: ocrResultItems,
                    image: input.imageBuffer
                }
            ]
        });

        result.ocr_engine_name = this.name;
        result.language = input.language;

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

    async sendRequest( image: Buffer ): Promise< lens.LensOverlayServerResponse | undefined > {

        // const cookie = await this.getCookie();

        try {
            const request = await this.createRequest( image );
            const response = await axios.request( request );

            const responseData = lens.LensOverlayServerResponse.decode( response.data );

            if ( responseData.error )
                console.log( responseData.error );

            return responseData;

        } catch (error) {
            console.error( error );
        }
    }

    async createRequest( image: Buffer ) {

        const imageBytes = await this.rescaleImage( image );
        const imageMetadata = await sharp( imageBytes ).metadata();

        const rpcRequest = new lens.LensOverlayServerRequest({

            // lens_overlay_service_deps.proto
            objectsRequest: { 

                // lens_overlay_image_data.proto
                imageData: {
                    payload: {
                        imageBytes: imageBytes, // Proto bytes
                    },
                    imageMetadata: { //! Required
                        width: imageMetadata.width,
                        height: imageMetadata.height,
                    },
                    // significantRegions: //! Important
                },

                // lens_overlay_service_deps.proto
                requestContext: {

                    // lens_overlay_request_id.proto
                    requestId: { //! Required
                        uuid: Number( crypto.randomBytes(8).readBigUInt64BE(0) ), // Proto uint64; C++ RandBytesAsString(kAnalyticsIdBytesSize);
                        sequenceId: 0, // Proto int32
                        imageSequenceId: 0, // Proto int32
                        analyticsId: crypto.randomBytes(16), // Proto bytes; RandBytesAsString(kAnalyticsIdBytesSize);
                        routingInfo: new lens.LensOverlayRoutingInfo(), // ?
                    },

                    // lens_overlay_client_context.proto
                    clientContext: {

                        // lens_overlay_platform.proto
                        platform: lens.Platform.WEB, //! Required

                        // lens_overlay_surface.proto
                        // surface:  lens.Surface.SURFACE_CHROMIUM, //! Optional

                        // appId: "com.google.android.apps.lens" //! Required; Proto string
                        localeContext: { //! Optional ?
                            language: "en", // BCP 47 tag
                            region: "US", // CLDR region tag
                            timeZone: "America/New_York" // CLDR time zone ID
                        },

                        // lens_overlay_filters.proto
                        clientFilters: { //! Optional ?
                            filter: [
                                { filterType: lens.LensOverlayFilterType.AUTO_FILTER }
                            ]
                        },
                        // renderingContext:  //! Optional
                    },

                }
            },
        });

        const rpcRequestData = lens.LensOverlayServerRequest.encode(rpcRequest).finish();

        const url = new URL('https://lensfrontend-pa.googleapis.com/v1/crupload');

        const requestConfig: AxiosRequestConfig = {
            method: 'post',
            url: url.toString(),
            headers: { 
                'host': url.host,
                'content-type': 'application/x-protobuf',
                'x-goog-api-key': this.apiKey, //! Important
                'sec-fetch-site': 'none',
                'sec-fetch-mode': 'no-cors',
                'sec-fetch-dest': 'empty',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9,ja-JP;q=0.8,ja;q=0.7',
                // 'cookie': // Required?
            },
            data: rpcRequestData,
            responseType: 'arraybuffer',
        }

        return requestConfig;
    }

    handleOcrData( data: lens.LensOverlayServerResponse, contextResolution: OcrResultContextResolution ): OcrItemScalable[] {

        const rawParagraphs = data?.objectsResponse?.text?.textLayout?.paragraphs;

        if ( !rawParagraphs ) return [];

        const paragraphs: OcrItemScalable[] = rawParagraphs?.map( (paragraphData, paragraphIdx) => {

            let paragraphIsVertical = (
                paragraphData.writingDirection === lens.WritingDirection.WRITING_DIRECTION_TOP_TO_BOTTOM
            );

            const paragraphBoxData = paragraphData.geometry?.boundingBox;

            const paragraphCenterX = Number(paragraphBoxData?.centerX);
            const paragraphCenterY = Number(paragraphBoxData?.centerY);
            const paragraphWidth = Number(paragraphBoxData?.width);
            const paragraphHeight = Number(paragraphBoxData?.height);
            const paragraphAngle = Number(paragraphBoxData?.rotationZ);//! radians


            const paragraphLines: OcrTextLineScalable[] = paragraphData.lines?.map( lineData => {
                
                const lineTextData = lineData.words;
                const lineBoxData = lineData.geometry?.boundingBox;

                const lineCenterX = Number(lineBoxData?.centerX);
                const lineCenterY = Number(lineBoxData?.centerY);
                const lineWidth = Number(lineBoxData?.width);
                const lineHeight = Number(lineBoxData?.height);
                const lineAngle = Number(lineBoxData?.rotationZ);//! radians

                let words: OcrTextWordScalable[] = [];
                let text: string = lineTextData?.map( ( word ) => {
                    return word.plainText + ( word.textSeparator || '' );
                }).join('') || '';

                // console.log( lineTextData );
                // console.log( lineBoxData );
                // console.log(text)

                const isVertical = paragraphIsVertical;
                
                if ( !isVertical ) {
                    text = lineTextData
                        ?.sort( ( a, b ) => {
                            const aPositionLeft = Number(a.geometry?.boundingBox?.centerX);
                            const bPositionLeft = Number(b.geometry?.boundingBox?.centerX);
                            return aPositionLeft - bPositionLeft;
                        })
                        ?.map(
                            ( word ) =>  {
                                const boundingBox = word.geometry?.boundingBox;

                                if ( !boundingBox )
                                    return '';

                                const wordCenterX = Number(boundingBox.centerX);
                                const wordCenterY = Number(boundingBox.centerY);
                                const wordWidth = Number(boundingBox.width);
                                const wordHeight = Number(boundingBox.height);
                                const wordAngle = Number(boundingBox.rotationZ);//! radians

                                const wordScalable: OcrTextWordScalable  = {
                                    word: word.plainText || '',
                                    box: {
                                        position: {
                                            left: (wordCenterX - (wordWidth/2)) * 100,
                                            top: (wordCenterY - (wordHeight/2)) * 100,
                                        },
                                        dimensions: {
                                            width: wordWidth * 100,
                                            height: wordHeight * 100
                                        },
                                        angle_radians: wordAngle - lineAngle,
                                        angle_degrees: 0,
                                        isVertical,
                                        transform_origin: 'center'
                                    },
                                    letter_spacing: 0
                                }

                                words.push(wordScalable);

                                return word.plainText + ( word.textSeparator || '' );
                            } 
                        ).join('') || '';
                }

                paragraphIsVertical =  paragraphIsVertical || isVertical; 

                const box: OcrResultBoxScalable = { 
                    position: {
                        left: (lineCenterX - (lineWidth/2)) * 100,
                        top: (lineCenterY - (lineHeight/2)) * 100,
                    },
                    dimensions: {
                        width: lineWidth * 100,
                        height: lineHeight * 100
                    },
                    angle_radians: lineAngle - paragraphAngle,
                    angle_degrees: 0,
                    isVertical,
                    transform_origin: 'center'
                };
            
                const line: OcrTextLineScalable = {
                    content: text,
                    box,
                    words
                };

                return line;
            }) || [];

            if ( paragraphIsVertical ) {
                paragraphLines.sort( ( a: OcrTextLineScalable, b: OcrTextLineScalable ) => {
                    return Number(b.box?.position.left) - Number(a.box?.position.left);
                });
            }

            const paragraph: OcrItemScalable = {
                id: paragraphIdx.toString(),
                text: paragraphLines,
                box: {
                    position: {
                        left: (paragraphCenterX - (paragraphWidth/2)) * 100,
                        top: (paragraphCenterY - (paragraphHeight/2)) * 100,
                    },
                    dimensions: {
                        width: paragraphWidth * 100,
                        height: paragraphHeight * 100,
                    },
                    isVertical: paragraphIsVertical,
                    angle_radians: paragraphAngle, 
                    angle_degrees: 0,
                    transform_origin: 'center',
                },
                classification_label: 0,
                classification_score: 1,
                recognition_score: 1,
                recognition_state: 'RECOGNIZED'
            };

            return paragraph;
        });


        return paragraphs;
    }

    async rescaleImage(
        image: Buffer,
        maxArea = 1_000_000, // kMaxAreaForImageSearch
        maxPixels = 1000, // kMaxPixelsForImageSearch 
    ): Promise< Buffer > {
        // 2_764_800 of area is equivalent to 1080p (21:9)

        const sharpImage = sharp(image);

        const { width, height } = await sharpImage.metadata();

        console.log({ width, height });

        if ( !width || !height )
            return image;


        let newWidth = width;
        let newHeight = height;

        if ( width > height && width > maxPixels ) {
            newWidth = maxPixels;
            newHeight = Math.floor( height * (newWidth / width) );
        }
        else if ( height > width && height > maxPixels ) {
            newHeight = maxPixels;
            newHeight = Math.floor( width * (newHeight / height) );
        }

        const area = width * height;
        
        if (
            newWidth == width &&
            newHeight == height &&
            area < maxArea
        )
            return image;
        

        const newArea = newWidth * newHeight;
        
        if ( newArea > maxArea ) {
            newWidth = Math.floor(
                Math.sqrt( ( maxArea * newWidth ) / newHeight )
            );
            newHeight = Math.floor(
                Math.sqrt( ( maxArea * newHeight) / newWidth )
            );
        }

        console.log({ newWidth, newHeight });
        
        return await sharpImage.resize({
            width: newWidth,
            height: newHeight
        }).toBuffer();
    }

    async getSupportedLanguages(): Promise< string[] > {
        return [];
    }

    async getSupportedModels(): Promise<TextRecognitionModel[]> {
        return [];
    }

    async updateSettings(
        settingsUpdate: OcrEngineSettingsU,
        oldSettings?: OcrEngineSettingsU | undefined
    ): Promise< UpdateOcrAdapterSettingsOutput< GoogleLensOcrEngineSettings > > {

        // TODO: Settings validation

        // settingsUpdate = settingsUpdate as GoogleLensOcrEngineSettings;
        // oldSettings = settingsUpdate as GoogleLensOcrEngineSettings;

        const lensSettings = settingsUpdate as GoogleLensOcrEngineSettings;

        if ( lensSettings?.api_key )
            this.apiKey = lensSettings?.api_key;

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

        if ( !this.prevImage?.equals ) return false;

        const isSameImage = this.prevImage.equals( image );

        if ( !isSameImage ) return false;

        return true;
    }

}