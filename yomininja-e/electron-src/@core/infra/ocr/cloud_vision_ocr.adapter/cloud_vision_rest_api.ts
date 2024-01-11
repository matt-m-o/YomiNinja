import { google } from '@google-cloud/vision/build/protos/protos';
import axios, { AxiosInstance } from 'axios';
import { CloudVisionApi } from './cloud_vision_api';

export class CloudVisionRestAPI implements CloudVisionApi {

    public baseUrl: string;
    private httpClient: AxiosInstance;
    private token: string;
    private proxyUrl: string | undefined;

    constructor(
        input: {
            token: string;
            proxyUrl?: string;
        }
    ) {
        this.token = input.token;
        this.proxyUrl = input.proxyUrl;

        this.httpClient = axios.create({
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "text/plain;charset=UTF-8",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "cross-site",
            }
        });
    }

    async textDetection( image: Buffer | string ): Promise< google.cloud.vision.v1.IAnnotateImageResponse > {

        let base64Image: string;

        if ( typeof image !== 'string' )
            base64Image = image.toString('base64');
        else 
            base64Image = image;

        const results = await this.annotate({
            base64Image,
            type: 'TEXT_DETECTION'
        });

        const [ result ] = results;

        return result;
    }

    async annotate(
        input: {
            base64Image: string,
            type: (
                'DOCUMENT_TEXT_DETECTION' |
                'TEXT_DETECTION' |
                'LABEL_DETECTION' |
                'CROP_HINTS'
            )
        }
    ): Promise< google.cloud.vision.v1.IAnnotateImageResponse[] > {

        const { base64Image, type } = input;

        let url = `https://vision.googleapis.com/v1/images:annotate`;

        if ( this.proxyUrl )
            url = `${this.proxyUrl}?url=${ encodeURIComponent(url) }`;

        url = url + `&token=${this.token}`
        
        try {

            const data = {
                requests: [
                    {
                        features: [				
                            {
                                maxResults: 50,
                                type: type
                            }
                        ],
                        image: {
                            content: base64Image
                        }
                    }
                ]
            }

            const response = await this.httpClient.post( url, data );

            return response.data.responses as google.cloud.vision.v1.IAnnotateImageResponse[];

        } catch ( error ) {
            console.log( error );
        }
        
        return []
    }
    

}