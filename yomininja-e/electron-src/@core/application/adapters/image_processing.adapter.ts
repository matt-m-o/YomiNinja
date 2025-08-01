import { ImagePreprocessingOperation } from "../../domain/ocr_template/ocr_target_region/ocr_target_region";

export type ImageResizeInput = {    
    imageBuffer: Buffer;
    scaling_factor: number;    
};

export type ImageResizeOutput = {
    resizedImage: Buffer;
    width?: number;
    height?: number;
};

export type ImageExtractInput = {
    image: Buffer;
    position: {
        left: number;
        top: number;
    };
    size: {
        width: number;
        height: number;
    };
};

export type ImageMetadata = {
    width: number;
    height: number;
}

export interface ImageProcessingAdapter {
    resize: ( input: ImageResizeInput ) => Promise< ImageResizeOutput >;
    invertColors: ( image: Buffer ) => Promise< Buffer >;
    extract: ( input: ImageExtractInput ) => Promise< Buffer >;
    getMetadata: ( image: Buffer ) => Promise< ImageMetadata >;
    applyPipeline: ( image: Buffer, pipelineOperations: ImagePreprocessingOperation[] ) => Promise< Buffer >;
}