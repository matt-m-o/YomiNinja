import { ImageProcessingAdapter, ImageResizeInput, ImageResizeOutput } from "../../../application/adapters/image_processing.adapter";


export class ImageProcessingDummyAdapter implements ImageProcessingAdapter {

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
}