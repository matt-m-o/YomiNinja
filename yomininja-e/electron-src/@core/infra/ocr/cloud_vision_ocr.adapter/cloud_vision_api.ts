import { google } from '@google-cloud/vision/build/protos/protos';

export type CloudVisionAPICredentials = {
    privateKey?: string;
    clientEmail?: string;
    token?: string;
};

export interface CloudVisionApi {
    hasCredentials: boolean;
    textDetection: ( input: string | Buffer ) => Promise< google.cloud.vision.v1.IAnnotateImageResponse | undefined >;
    updateCredentials: ( credentials: CloudVisionAPICredentials ) => void;
};