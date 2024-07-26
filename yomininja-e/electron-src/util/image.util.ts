import sharp, { AvailableFormatInfo, FormatEnum } from "sharp";

export async function bufferToDataURL(
    input: {
        image: Buffer,
        format?: keyof FormatEnum,
        quality?: number
    }
): Promise<string> {
    const { image, quality } = input;
    
    let format: keyof FormatEnum = input.format || ('png' as keyof FormatEnum);

    let sharpImage = sharp(image);
    const metadata = await sharpImage.metadata();

    if ( !metadata.format ) return '';

    if ( !format ) {
        format = metadata.format || 'png';
    }

    const prefix = 'data:image/' + format + ';base64,';

    let conversionOptions = format !== 'png' ?
        { quality } :
        undefined;

    const base64Data = ( metadata.format !== format ?
            await sharpImage.toFormat( format, conversionOptions ).toBuffer() :
            image
        )
        .toString('base64');

    return prefix + base64Data;
}