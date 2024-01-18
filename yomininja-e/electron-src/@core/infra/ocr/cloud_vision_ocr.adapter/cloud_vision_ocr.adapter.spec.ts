import { CloudVisionOcrAdapter } from "./cloud_vision_ocr.adapter";
import { getCloudVisionDefaultSettings } from "./cloud_vision_ocr_settings";
import { CloudVisionRestAPI } from "./cloud_vision_rest_api";
import { base64Image } from "./test/base64_image";
import { cloudVisionToken, proxyUrl } from "./test/test_data";


describe('CloudVisionOcrAdapter tests', () => {

    let cloudVisionAPI: CloudVisionRestAPI;
    let ocrAdapter: CloudVisionOcrAdapter;

    beforeEach( () => {

        cloudVisionAPI = new CloudVisionRestAPI({
            token: cloudVisionToken,
            proxyUrl
        });

        ocrAdapter = new CloudVisionOcrAdapter( cloudVisionAPI );
    });
    
    it('should extract text from a base64 image', async () => {

        const result = await ocrAdapter.recognize({
            imageBuffer: Buffer.from( base64Image, 'base64' ),
            languageCode: 'ja'
        });

        expect( result?.results ).toHaveLength( 2 );
        expect( result?.results[0].text[0].content ).toStrictEqual( '開かない…のは当たり前か。' );
        expect( result?.results[1].text[0].content ).toStrictEqual( 'ここは先頭車両で、こっちはその先頭の方だもんな。' );
    });

    it('should update the credentials', async () => {

        cloudVisionAPI.token = '';

        await ocrAdapter.updateSettings({
            ...getCloudVisionDefaultSettings(),
            token: cloudVisionToken
        });

        const result = await ocrAdapter.recognize({
            imageBuffer: Buffer.from( base64Image, 'base64' ),
            languageCode: 'ja'
        });

        expect( result?.results ).toHaveLength( 2 );
    });
})