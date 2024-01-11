import { CloudVisionRestAPI } from './cloud_vision_rest_api';
import { base64Image } from './test/base64_image';
import { cloudVisionToken, proxyUrl } from './test/test_data';

describe("Cloud Vision REST API tests", () => {

    let cloudVisionAPI: CloudVisionRestAPI;

    beforeEach( () => {

        cloudVisionAPI = new CloudVisionRestAPI({
            token: cloudVisionToken,
            proxyUrl
        });
    });

    it('should extract text from a base64 image', async () => {

        const result = await cloudVisionAPI.textDetection( base64Image );

        let paragraphs: string[] = [];

        result?.fullTextAnnotation?.pages?.forEach( page => {
            page.blocks?.forEach( block => {

                block.paragraphs?.forEach( paragraph => {

                    const { words } = paragraph

                    const flatParagraph = words?.map(
                            word => word.symbols?.map( symbol => symbol.text ).join('') 
                        ).join('');

                    if ( !flatParagraph ) return;

                    paragraphs.push( flatParagraph );
                });

            });
        });


        expect( paragraphs ).toHaveLength( 2 );
        expect( paragraphs?.[0] ).toStrictEqual( '開かない…のは当たり前か。' );
        expect( paragraphs?.[1] ).toStrictEqual( 'ここは先頭車両で、こっちはその先頭の方だもんな。' );
    });


});