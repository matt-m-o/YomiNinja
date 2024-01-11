import { google } from '@google-cloud/vision/build/protos/protos';

export interface CloudVisionApi {
    textDetection: ( input: string | Buffer ) => Promise< google.cloud.vision.v1.IAnnotateImageResponse >;
};