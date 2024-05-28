import { ImageExtractInput, ImageMetadata, ImageProcessingAdapter, ImageResizeInput, ImageResizeOutput } from '../../application/adapters/image_processing.adapter';
import sharp from 'sharp';

export class SharpImageProcessingAdapter implements ImageProcessingAdapter {
    
    async resize( input: ImageResizeInput ): Promise< ImageResizeOutput > {
        
        // console.time("Sharp.resize");
        
        const { imageBuffer, scaling_factor } = input;        
        
        const sharpInstance = sharp( imageBuffer );
        
        
        if ( scaling_factor == 1 ) {
            
            // console.timeEnd("Sharp.resize");
            return {
                resizedImage: imageBuffer,
            }
        }
        
        const imageMetadata = await sharpInstance.metadata();        
        
        const width = imageMetadata.width;
        const height = imageMetadata.height;
        
        if ( !width || !height ) {
            
            // console.timeEnd("Sharp.resize");
            return {
                resizedImage: imageBuffer
            };
        }
        
        const newWidth = Math.floor( width * scaling_factor );
        const newHeight = Math.floor( height * scaling_factor );        
        
        // console.timeEnd("Sharp.resize");
        return {
            resizedImage: await sharpInstance.resize( newWidth, newHeight ).toBuffer(),
            width: newWidth,
            height: newHeight
        }
    }
    
    
    async invertColors( imageBuffer: Buffer ): Promise<Buffer> {
        
        // console.time('sharp.negate');
        const result = await sharp( imageBuffer )
        .negate()
        .toBuffer();
        // console.timeEnd('sharp.negate');
        
        return result;
    }

    async extract( input: ImageExtractInput ): Promise< Buffer > {

        if ( input.position.left < 0 )
            input.position.left = 0;

        if ( input.position.top < 0 )
            input.position.top = 0;

        return await sharp( input.image )
            .extract({
                ...input.position,
                ...input.size,
            })
            .toBuffer();
    }

    async getMetadata( image: Buffer ): Promise<ImageMetadata> {

        const metadata = await sharp( image )
            .metadata();

        return {
            width: metadata?.width || 0,
            height: metadata?.height || 0,
        };
    }
}