import { ImageAnnotatorClient } from '@google-cloud/vision';
import { google } from "@google-cloud/vision/build/protos/protos";
import { CloudVisionAPICredentials, CloudVisionApi } from "./cloud_vision_api";



export class CloudVisionNodeAPI implements CloudVisionApi {

    private client: ImageAnnotatorClient;
    hasCredentials: boolean = false;

    constructor( input?: CloudVisionAPICredentials ) {

        if ( !input ) return;

        this.initialize( input );
    }

    initialize( input: CloudVisionAPICredentials ) {

        this.client = new ImageAnnotatorClient({
            credentials: {
                private_key: input.privateKey?.replaceAll( '\\n', '\n' ),
                client_email: input.clientEmail,
            }
        });

        this.hasCredentials = Boolean( input?.privateKey && input?.clientEmail );
    }
    
    async textDetection(
        input: string | Buffer
    ): Promise< google.cloud.vision.v1.IAnnotateImageResponse | undefined > {
        
        const [ result ] = await this.client.textDetection( input );
    
        return result;
    }

    updateCredentials( credentials: CloudVisionAPICredentials ) {

        this.initialize( credentials );
    }
}