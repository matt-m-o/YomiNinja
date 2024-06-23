import { OcrItemScalable, OcrTextLineScalable } from "../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";


export function isEolCharacter( char: string ): boolean {
    return [
        ';', '!', '！', '?', '？', '⁉',
        '.', '。', '…', '．',
    ].includes(char);
}

export function symbolIncludesSpacing( symbol: string ): boolean {
    return [
        '。', '．', '、', '，', 
        '「', '」', '『', '』',  '（', '）', '〔', '〕', '［', '］', '｛', '｝',
        '｟', '｠', '〈', '〉', '《', '》', '【', '】', '〖', '〗', '〘', '〙', '〚', '〛',
        '〝', '〟'
    ].includes(symbol);
}

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

export function getBestFontStyle( input: {
    text: string;
    maxWidth: number;
    maxHeight: number;
    initialFontSize: number;
    initialSpacing?: number;
    isVertical: boolean;
}): { fontSize: number, letterSpacing: number } {

    let { text } = input;

    const {
        maxWidth,
        maxHeight,
        initialFontSize,
        initialSpacing,
        isVertical,
    } = input;

    const fontFamily = 'arial';

    let maxSideLength = isVertical ? maxHeight : maxWidth;
    let maxFontSize = initialFontSize;

    if ( isVertical ) {
        maxSideLength = maxHeight;
        maxFontSize = maxWidth;
    }
    else {
        maxSideLength = maxWidth;
        maxFontSize = maxHeight;
    }


    let fontSize = initialFontSize;
    let bestSizeFound = false;
    let increased = false;
    let decreased = false;

    // const canvas = new OffscreenCanvas( 2*maxWidth, 2*maxHeight )
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if ( !text ) {
        return {
            fontSize: initialFontSize,
            letterSpacing: initialSpacing
        }
    }

    if ( 
        text.length > 1 &&
        symbolIncludesSpacing( text[text.length-1] )
    ){
        text = text.slice(0, text.length-1) + '';
    }
    else if (
        text.length == 1 &&
        symbolIncludesSpacing( text )
    ) {
        text = text.slice(0, text.length-1) + '.';
    }

    context.font = `${fontSize}px ${fontFamily}`;
    let metrics = context.measureText(text);

    fontSize = fontSize * (maxSideLength / metrics.width);

    let sizeIterations = 0;
    
    while ( !bestSizeFound ) {

        sizeIterations++;
        if (sizeIterations > 50) {
            console.log(`Breaking size iterations | text: "${text}"`);
            break;
        }

        context.font = `${fontSize}px ${fontFamily}`;
        metrics = context.measureText(text);

        if ( metrics.width > maxSideLength ) {
            fontSize -= 1; // 0.5;
            decreased = true;
        }

        else if ( metrics.width < maxSideLength * 0.99 ) {
            fontSize += 1; // 0.5;
            increased = true;
        }
        else
            bestSizeFound = true;

        if ( fontSize < 0 ) {
            fontSize = 1;
            bestSizeFound = true;
        }

        if (increased && decreased)
            bestSizeFound = true;
    }

    if ( fontSize > maxFontSize ) // maxFontSize * 1.12
        fontSize = maxFontSize; // maxFontSize * 1.12;

    context.font = `${fontSize}px ${fontFamily}`;

    if ( typeof initialSpacing === 'undefined'  || isVertical )
        return { fontSize, letterSpacing: 0 }

    let bestSpacingFound = false;
    increased = false;
    decreased = false;
    let letterSpacing = initialSpacing;

    let spacingIterations = 0;

    while ( !bestSpacingFound ) {

        spacingIterations++;
        if (spacingIterations > 50) {
            console.log(`Breaking spacing iterations | text: "${text}"`);
            break;
        }
        
        context.letterSpacing = letterSpacing + 'px';
        const metrics = context.measureText(text);

        if ( metrics.width > maxSideLength ) {
            letterSpacing -= 1; // 0.5;
            decreased = true;
        }

        else if ( metrics.width < maxSideLength * 0.99 ) {
            letterSpacing += 1; // 0.5;
            increased = true;
        }
        else
            bestSpacingFound = true;

        if ( letterSpacing < 0 ) {
            letterSpacing = 0;
            bestSpacingFound = true;
        }

        if (increased && decreased)
            bestSpacingFound = true;
    }

    return {
        fontSize,
        letterSpacing
    };
}


export function getSymbolPositionOffset(
    input: {
        symbol: string;
        vertical: boolean;
        fontSize: number;
    }
): {
    topOffset: number;
    leftOffset: number;
} {

    let topOffset = 0;
    let leftOffset = 0;

    if ( [ '【', '『', '「' ].includes( input.symbol ) ) {

        if ( !input.vertical )
            leftOffset = -input.fontSize * 0.5;
        else
            topOffset = -input.fontSize * 0.5;
    }

    return {
        topOffset,
        leftOffset
    }
}