import sharp from 'sharp';
import { base64Image } from '../cloud_vision_ocr.adapter/test/base64_image';
import { GoogleLensOcrAdapter } from './google_lens_ocr.adapter';

describe('CloudVisionOcrAdapter tests', () => {

    // let cloudVisionAPI: CloudVisionRestAPI;
    let ocrAdapter: GoogleLensOcrAdapter;

    beforeEach( () => {

        ocrAdapter = new GoogleLensOcrAdapter();

    });
    
    it('should extract text from a simple image', async () => {

        const result = await ocrAdapter.recognize({
            imageBuffer: Buffer.from( base64Image, 'base64' ),
            languageCode: 'ja'
        });

        expect( result?.ocr_regions ).toHaveLength( 1 );

        const items = result?.ocr_regions[0].results;
        expect( items ).toHaveLength(2);

        if ( !items ) return;

        expect( items[0].text[0].content ).toStrictEqual( '開かない･･･のは当たり前か。' );
        expect( items[1].text[0].content ).toStrictEqual( 'ここは先頭車両で、こっちはその先頭の方だもんな。' );
    });
    
    it('should extract vertical text', async () => {

        const imageBuffer = await sharp('./data/vertical text.png').toBuffer();

        const result = await ocrAdapter.recognize({
            imageBuffer,
            languageCode: 'ja'
        });

        expect( result?.ocr_regions ).toHaveLength( 1 );

        const items = result?.ocr_regions[0].results;
        expect( items ).toHaveLength(2);

        if ( !items ) return;

        expect( items[0].text[0].content ).toStrictEqual( '開かない･･･のは当たり前か。' );
        expect( items[1].text[0].content ).toStrictEqual( 'ここは先頭車両で、こっちはその先頭の方だもんな。' );
    });
})