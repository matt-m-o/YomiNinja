import { ImageExtractInput, ImageMetadata, ImageProcessingAdapter, ImageResizeInput, ImageResizeOutput } from '../../application/adapters/image_processing.adapter';
import sharp from 'sharp';
import { ImagePreprocessingOperation } from '../../domain/ocr_template/ocr_target_region/ocr_target_region';

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
            resizedImage: await sharpInstance.resize( newWidth, newHeight, { kernel: 'cubic' } ).toBuffer(),
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

    async applyPipeline( image: Buffer, pipelineOperations: ImagePreprocessingOperation[] ): Promise< Buffer > {

        if ( !pipelineOperations?.length ) return image;

        const originalMetadata = await sharp( image ).metadata();

        if ( 
            !originalMetadata.width ||
            !originalMetadata.height
        ) return image;

        let sharpPipeline = sharp( image );

        let isOriginalSize = true;

        for ( const operation of pipelineOperations ) {

            if ( !operation.enabled ) continue;

            const operationName = operation.name.toLocaleLowerCase();

            if ( operationName === 'resize' ) {
                let scale_factor: number = 1;

                if ( operation?.args && 'scale_factor' in operation?.args )
                    scale_factor = Number( operation.args.scale_factor );

                if ( scale_factor === 1 && isOriginalSize ) continue;

                if ( !isOriginalSize ) {
                    sharpPipeline = sharp( await sharpPipeline.toBuffer() );
                }

                sharpPipeline.resize(
                    Math.floor( originalMetadata.width * scale_factor ),
                    Math.floor( originalMetadata.height * scale_factor ),
                    {
                        kernel: 'cubic'
                    }
                );

                isOriginalSize = false;
            }
            else if ( operationName === 'blur' ) {
                let sigma: number | undefined;

                if ( operation?.args && 'sigma' in operation?.args )
                    sigma = Number(operation.args.sigma);

                sharpPipeline.blur( sigma );
            }
            else if ( operationName === 'grayscale' ) {
                sharpPipeline.grayscale();
            }
            else if ( operationName === 'invert colors' ) {
                sharpPipeline.negate();
            }
            else if ( operationName === 'threshold' ) {
                let threshold: number | undefined;

                if ( operation?.args && 'threshold' in operation?.args )
                    threshold = Number( operation.args.threshold );

                sharpPipeline.threshold( threshold );
            }
        }
            
        return await sharpPipeline.toBuffer();
    }
}