import { OcrItemScalable } from "../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";

export function removeFurigana( input: OcrItemScalable[] ) {

    input.forEach( item => {

        let isVertical = item.box.isVertical;
        let averageFontSize = 0;
        let maxFontSize = 0

        if ( isVertical ) return;

        item.text.forEach( line => {

            if (
                !line.box?.dimensions?.height ||
                !line.box?.dimensions?.width
            ) return;

            const lineDims = line.box.dimensions;

            const fontSize = isVertical ? lineDims.width : lineDims.height;

            averageFontSize += fontSize;
            if ( fontSize > maxFontSize )
                maxFontSize = fontSize;
        });

        averageFontSize = averageFontSize / item.text.length;

        const minFontSize = ( ( averageFontSize + maxFontSize ) / 2 ) * 0.6;

        item.text = item.text.filter( line => {

            if (
                !line.box?.dimensions?.height ||
                !line.box?.dimensions?.width
            ) return;

            const lineDims = line.box.dimensions;

            const fontSize = isVertical ? lineDims.width : lineDims.height;

            // if ( line.content.includes('') ) {
            //     console.log({
            //         content: line.content,
            //         averageFontSize,
            //         minFontSize,
            //         fontSize,
            //     });
            // }

            return fontSize > minFontSize;
        })
    });

    return input;
}