import { ImageExtractInput, ImageMetadata, ImageProcessingAdapter, ImageResizeInput, ImageResizeOutput } from "../../../application/adapters/image_processing.adapter";
import { ImagePreprocessingOperation } from "../../../domain/ocr_template/ocr_target_region/ocr_target_region";


export class FakeImageProcessingAdapter implements ImageProcessingAdapter {
    
    public dummyImageSize = {
        width: 1920,
        height: 1080,
    };
    
    setDummySize( dummyImageSize: { width: number, height: number }) {
        this.dummyImageSize = dummyImageSize;
    }
    
    async resize( input: ImageResizeInput ): Promise<ImageResizeOutput> {
        
        const { imageBuffer, scaling_factor } = input;
        
        const { width, height } = this.dummyImageSize;
        
        const newWidth = width * scaling_factor;
        const newHeight = height * scaling_factor;

        return {
            resizedImage: imageBuffer,
            width: newWidth,
            height: newHeight,
        }
    }
    
    async invertColors( imageBuffer: Buffer ) {
        return imageBuffer;
    }

    async extract( input: ImageExtractInput ) {
        return input.image;
    }

    async getMetadata( image: Buffer ) {
        return {
            width: 1000,
            height: 1000
        };
    };

    applyPipeline: (image: Buffer, operations: ImagePreprocessingOperation[]) => Promise<Buffer>;
}