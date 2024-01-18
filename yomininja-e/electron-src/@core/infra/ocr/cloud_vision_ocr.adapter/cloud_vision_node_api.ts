import { ImageAnnotatorClient } from '@google-cloud/vision';
import { google } from "@google-cloud/vision/build/protos/protos";
import { CloudVisionApi } from "./cloud_vision_api";


export class CloudVisionNodeAPI implements CloudVisionApi {

    private client: ImageAnnotatorClient;

    constructor(
        input: {
            privateKey: string;
            clientEmail: string;
        }
    ) {

        this.client = new ImageAnnotatorClient({
            credentials: {
                private_key: input.privateKey,
                client_email: input.clientEmail,
            }
        });
    }
    
    async textDetection(
        input: string | Buffer
    ): Promise< google.cloud.vision.v1.IAnnotateImageResponse | undefined > {
        
        const [ result ] = await this.client.textDetection( input );
    
        return result;
    }
    
}