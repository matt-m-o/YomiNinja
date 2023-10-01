import { ImageResizeInput } from "../../../application/adapters/image_processing.adapter";
import { ImageProcessingDummyAdapter } from "./image_processing_dummy.adapter";


describe( 'ImageProcessingDummyAdapter tests', () => {

    let imageProcessingAdapter: ImageProcessingDummyAdapter;

    beforeEach( () => {

        imageProcessingAdapter = new ImageProcessingDummyAdapter();
    })

    it('should resize a 1920x1080 image using a 0.5 scaling factor', async () => {

        imageProcessingAdapter.setDummySize({
            width: 1920,
            height: 1080,
        })

        const imageBuffer = Buffer.from( 'text' );

        const input: ImageResizeInput = {
            imageBuffer,            
            scaling_factor: 0.5,
        };

        const output = await imageProcessingAdapter.resize( input ); console.log( output );

        expect( output.width ).toStrictEqual( 960 );
        expect( output.height ).toStrictEqual( 540 );

    });
});