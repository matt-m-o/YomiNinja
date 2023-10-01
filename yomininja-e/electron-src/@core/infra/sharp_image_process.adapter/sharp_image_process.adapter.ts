import { ImageProcessingAdapter, ImageResizeInput, ImageResizeOutput } from '../../application/adapters/image_processing.adapter';
import sharp from 'sharp';

export class SharpImageProcessingAdapter implements ImageProcessingAdapter {
    
    async resize( input: ImageResizeInput ): Promise< ImageResizeOutput > {

        const { imageBuffer, scaling_factor } = input;        

        const sharpInstance = sharp( imageBuffer );

        if ( scaling_factor == 1 ) {
            return {
                resizedImage: imageBuffer,
            }
        }
                
        const imageMetadata = await sharpInstance.metadata();        

        const width = imageMetadata.width;
        const height = imageMetadata.height;
        
        if ( !width || !height ) {

            return {
                resizedImage: imageBuffer
            };
        }
        
        const newWidth = width * scaling_factor;
        const newHeight = height * scaling_factor;
        
        const resizedImage = await sharpInstance.resize( newWidth, newHeight ).toBuffer();

        return {
            resizedImage,
            width: newWidth,
            height: newHeight
        }
    }
    
}