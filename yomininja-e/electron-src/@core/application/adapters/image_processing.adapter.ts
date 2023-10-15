
export type ImageResizeInput = {    
    imageBuffer: Buffer;
    scaling_factor: number;    
};

export type ImageResizeOutput = {
    resizedImage: Buffer;
    width?: number;
    height?: number;
}

export interface ImageProcessingAdapter {
    resize: ( input: ImageResizeInput ) => Promise< ImageResizeOutput >;
    invertColors: ( imageBuffer: Buffer ) => Promise< Buffer >;
}