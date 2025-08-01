import { ImageAnnotatorClient } from '@google-cloud/vision';
import { google } from "@google-cloud/vision/build/protos/protos";
import { CloudVisionAPICredentials, CloudVisionApi } from "./cloud_vision_api";
import fs from 'fs';


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
        // this.client.getProjectId()
        //     .then( id => {
        //             console.log({
        //                 google_cloud_project_id: id
        //             });
        //             console.log('\n');
        //         });

        this.hasCredentials = Boolean( input?.privateKey && input?.clientEmail );
    }
    
    async textDetection(
        input: string | Buffer
    ): Promise< google.cloud.vision.v1.IAnnotateImageResponse | undefined > {
        
        try {

            const [ result ] = await this.client.textDetection( input );

            // fs.writeFileSync('./data/google_cloud_vision_result.json', JSON.stringify(result));

            this.hasCredentials = true;
            
            return result;

        } catch (error) {
            console.error(error);
            this.hasCredentials = false;
        }
    }

    updateCredentials( credentials: CloudVisionAPICredentials ) {

        this.initialize( credentials );
    }
}