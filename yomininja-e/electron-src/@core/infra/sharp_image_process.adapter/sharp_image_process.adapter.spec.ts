import fs from 'fs';
import { join } from 'path';
import { SharpImageProcessingAdapter } from './sharp_image_process.adapter';
import { ImageResizeInput } from '../../application/adapters/image_processing.adapter';
import sharp from 'sharp';


describe( 'SharpImageProcessingAdapter tests', () => {

    let imageProcessingAdapter: SharpImageProcessingAdapter;
    
    let imageBuffer: Buffer = fs.readFileSync( join( __dirname, './1920x1080_gray.png' ) );

    beforeEach( () => {

        imageProcessingAdapter = new SharpImageProcessingAdapter();

    });


    it('should resize a 1920x1080 image file using a 0.5 scaling factor', async () => {

        const input: ImageResizeInput = {
            imageBuffer,
            scaling_factor: 0.5,
        };

        const output = await imageProcessingAdapter.resize( input );

        expect( output.resizedImage ).toBeDefined();
        expect( output.width ).toStrictEqual( 960 );
        expect( output.height ).toStrictEqual( 540 );

        const resizedImageMetadata = await sharp( output.resizedImage ).metadata();

        expect( output.width ).toStrictEqual( resizedImageMetadata.width );
        expect( output.height ).toStrictEqual( resizedImageMetadata.height );
    });
});