import { styled } from "@mui/material";
import { OcrResultBoxScalable, OcrTextLineScalable, OcrTextLineSymbolScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { CSSProperties, useContext, useEffect } from "react";
import { ProfileContext } from "../../context/profile.provider";


function isEolCharacter( char: string ): boolean {
    return [
        ';', '!', '！', '?', '？', '⁉',
        '.', '。', '…', '．',
    ].includes(char);
}

const SymbolsContainer = styled('span')({
    position: 'absolute',
    left: '0px',
    top: '0px'
});


export type OcrResultLineProps = {
    line: OcrTextLineScalable;
    box: OcrResultBoxScalable;
    regionWidthPx: number;
    regionHeightPx: number;
    sizeExpansionPx: number;
    ocrItemBoxVisuals: OverlayOcrItemBoxVisuals;
    contentEditable: boolean;
    isLastLine: boolean;
    onBlur?: () => void;
};

function getPositionOffset(
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

function getBestFontSize(
    line: OcrTextLineScalable,
    maxWidth: number,
    maxHeight: number,
    initialFontSize: number,
    isVertical = false,
) {
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
    let found = false;
    let increased = false;
    let decreased = false;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    let text = line.content;

    if ( ['。', '．'].includes( text[text.length-1] ) )
        text = text.slice(0, text.length-1) + '.';

    while ( !found ) {

        context.font = `${fontSize}px ${fontFamily}`;
        const metrics = context.measureText(text);

        if ( metrics.width > maxSideLength ) {
            fontSize -= 1; // 0.5;
            decreased = true;
        }

        else if ( metrics.width < maxSideLength * 0.95 ) {
            fontSize += 1; // 0.5;
            increased = true;
        }
        else
            found = true;

        if ( fontSize < 0 ) {
            fontSize = 1;
            found = true;
        }

        if (increased && decreased)
            found = true;
    }

    if ( fontSize > maxFontSize * 1.12 )
        fontSize = maxFontSize;

    return fontSize;
}

export default function OcrResultLine( props: OcrResultLineProps ) {

    const {
        line,
        box,
        isLastLine,
        regionWidthPx,
        regionHeightPx,
        ocrItemBoxVisuals,
        contentEditable,
        sizeExpansionPx
    } = props;

    const { profile } = useContext( ProfileContext );

    const { active_ocr_language } = profile;

    const textSelectionStyle: CSSProperties = {
        backgroundColor: ocrItemBoxVisuals.selected_text.background_color,
        color: ocrItemBoxVisuals.selected_text.color,
    };

    const Line = styled('div')({
        transformOrigin: 'top left',
        whiteSpace: 'pre',
        width: 'max-content',
        '&::selection': textSelectionStyle,
        '& ruby': {
            '::selection': textSelectionStyle
        },
        '&:hover': {
            zIndex: '1000000'
        }
    });

    const Symbol = styled('span')({
        transformOrigin: 'top left',
        whiteSpace: 'pre',
        textAlign: 'center',
        '&::selection': textSelectionStyle,
    });

    let lineFontSize = 0;
    let fontSizeFactor = ocrItemBoxVisuals.text.font_size_factor;
    fontSizeFactor = fontSizeFactor ? fontSizeFactor / 100 : 1;
    let lineHeight = lineFontSize;

    line?.symbols?.forEach( symbol => {

        const charBoxHeightPx = ( regionHeightPx * ( symbol.box.dimensions.height / 100 ) );
        if ( charBoxHeightPx > lineFontSize )
            lineFontSize = charBoxHeightPx * fontSizeFactor;
    });


    let setLineHeight = true;

    let symbols: JSX.Element[];

    const lineBoxWidthPx = regionWidthPx * ( line?.box?.dimensions.width / 100 );
    const lineBoxHeightPx = regionHeightPx * ( line?.box?.dimensions.height / 100 );

    const lineLeft = line?.box ? line.box?.position.left - box.position.left : undefined;
    const lineTop = line?.box ? line.box?.position.top - box.position.top : undefined;

    let lineTopOffset = 0;
    let lineLeftOffset = 0;

    let eolSymbol = '。';
    let addEolSymbol = false;

    const { bcp47_tag } = active_ocr_language;

    if (
        !([ 'ja-JP', 'zh-Hans', 'zh-Hant', 'yue-Hans', 'yue-Hant' ]
        .some( tag => bcp47_tag === tag ))
    )
        eolSymbol = '.'


    if ( ocrItemBoxVisuals.text.character_positioning && line.symbols?.length ) {

        setLineHeight = !box.isVertical;
        lineFontSize = lineFontSize * fontSizeFactor;

        symbols = line?.symbols.map( ( symbol, sIdx ) => {

            let isLastSymbol = line?.symbols.length - 1 === sIdx;

            // let nextSymbol: OcrTextLineSymbolScalable;
            
            // if ( line?.symbols.length-1 >= sIdx+1 )
            //     nextSymbol = line?.symbols[ sIdx+1 ];
    
            const symbolBoxWidthPx = regionWidthPx * ( symbol.box.dimensions.width / 100 );
            const symbolBoxHeightPx = regionHeightPx * ( symbol.box.dimensions.height / 100 );
    
            let left = symbol.box.position.left - box.position.left;
            let top = symbol.box.position.top - box.position.top;

            let letterSpacing = 1;

            // Handle some special characters
            const { topOffset, leftOffset } = getPositionOffset({
                symbol: symbol.symbol,
                fontSize: lineFontSize,
                vertical: box.isVertical,
            });
            
            const leftPx = leftOffset + ( ( left / 100 ) * regionWidthPx ) + ( sizeExpansionPx / 2 );
            const topPx = topOffset + ( ( top / 100 ) * regionHeightPx ) + ( sizeExpansionPx / 2 );
                        
            const lineHeight: string = box.isVertical ? 'unset' : lineFontSize * 1.13 + 'px';

            if (
                isLastLine &&
                isLastSymbol &&
                !isEolCharacter(symbol.symbol)
            )
                addEolSymbol = true;
    
            return (
                <Symbol key={sIdx}
                    style={{
                        position: 'absolute',
                        width: symbolBoxWidthPx + 'px',
                        height: symbolBoxHeightPx + 'px',
                        left: leftPx + 'px',
                        top: topPx + 'px',
                        fontSize: lineFontSize + 'px',
                        letterSpacing: letterSpacing + 'px',
                        lineHeight: lineHeight + 'px',
                        transform: `rotate( ${ symbol.box.angle_degrees }deg )`,
                        border: 'none'
                    }}
                >
                    { symbol.symbol }
                </Symbol>
            )
        });

    }
    else {

        if ( box.isVertical ) {
            [ '．．．', '...', '･･･' ]
                .forEach( item => {
                    line.content = line.content.replaceAll(item, '…' );
                });
        }

        if ( !lineFontSize ) {
            lineFontSize = box.isVertical ? lineBoxWidthPx : lineBoxHeightPx;
            lineFontSize = getBestFontSize(
                line,
                lineBoxWidthPx,
                lineBoxHeightPx,
                lineFontSize,
                box?.isVertical
            );
            lineFontSize *= fontSizeFactor;
        }

        const firstSymbol = line?.content?.[0];
        const lastSymbol = line?.content?.[ line?.content.length - 1 ];

        // Handle some special characters
        const offsets = getPositionOffset({
            symbol: firstSymbol,
            fontSize: lineFontSize,
            vertical: box.isVertical,
        });

        lineTopOffset = offsets.topOffset;
        lineLeftOffset = offsets.leftOffset;

        if ( isLastLine && !isEolCharacter(lastSymbol) )
            addEolSymbol = true;
    }

    const symbolsContainerRotation = symbols ? -box.angle_degrees : 0;

    const symbolsContainer = symbols ? ( 
        <SymbolsContainer
            style={{
                transform: `rotate( ${symbolsContainerRotation}deg )`,
                fontSize: lineFontSize
            }}
        >
            {symbols}
        </SymbolsContainer>
    ) : undefined;
    
    
    let lineLeftPx: number;
    let lineTopPx: number;

    if ( lineTop !== undefined && lineLeft !== undefined ) {
        lineLeftPx = lineLeftOffset + ( ( lineLeft / 100 ) * regionWidthPx );
        lineTopPx = lineTopOffset + ( ( lineTop / 100 ) * regionHeightPx );
    }

    const linePositioning = (
        lineTopPx !== undefined &&
        ocrItemBoxVisuals.text.character_positioning
    ) ? 'absolute' : 'unset';


    lineHeight = box.isVertical ? lineBoxWidthPx : lineBoxHeightPx;

    const lineBaseCSS: CSSProperties = {
        minWidth: lineBoxWidthPx,
        minHeight: lineBoxHeightPx,
        writingMode: box?.isVertical ? 'vertical-rl' :'inherit',
        textOrientation: box?.isVertical ? 'upright' :'inherit',
        fontSize: lineFontSize ? lineFontSize+'px' : 'inherit',
        lineHeight: setLineHeight && lineFontSize ? lineHeight+'px' : 'inherit',
        margin: props.sizeExpansionPx / 2 + 'px',
    };

    const margin = props.sizeExpansionPx / 2 + 'px';

    const EOLSymbolStyle: CSSProperties = {
        color: 'inherit',
    };

    if ( ocrItemBoxVisuals?.text.sentence_ending_punctuation?.hidden ) {
        EOLSymbolStyle.width = '0px';
        EOLSymbolStyle.height = '0px';
        EOLSymbolStyle.color = 'transparent';
        EOLSymbolStyle.position = 'absolute';
    }

    const EOLSymbol = <span
        style={EOLSymbolStyle}
    >
        {addEolSymbol && eolSymbol}
    </span>

    const lineSizeHolder = (
        <span style={{
            ...lineBaseCSS,
            visibility: 'hidden',
            display: 'block',
            minWidth: box.isVertical ? '0px' : 'max-content',
            minHeight: !box.isVertical ? '0px' : 'max-content',
            maxWidth: box.isVertical ? '0px' : 'max-content',
            maxHeight: !box.isVertical ? '0px' : 'max-content',
            margin,
            marginTop: !box.isVertical ? margin : lineTopPx,
            marginLeft: box.isVertical ? margin : lineLeftPx,
        }}>
            {symbolsContainer || line.content}
            { ocrItemBoxVisuals?.text?.sentence_ending_punctuation?.enabled && EOLSymbol }
        </span>
    );

    if ( !line.content?.length )
        console.log('Empty line');

    return ( <span>
        { linePositioning === 'absolute' && lineSizeHolder }
        <Line
            contentEditable={contentEditable}
            onBlur={ ( e ) => {
                line.content = e.target.textContent;
                props?.onBlur();
            }}
            style={{
                ...lineBaseCSS,
                position: linePositioning,
                top: lineTopPx || '0%',
                left: lineLeftPx || '0%',
                // transformOrigin: line?.box?.transform_origin || 'left top',
                // transform: `rotate( ${line?.box?.angle_degrees}deg )`,
                borderRadius: ocrItemBoxVisuals.border_radius,// '0px',
                // textAlign: box.isVertical ? 'inherit' : 'left',
                backgroundColor: ocrItemBoxVisuals.background_color
            }}
        >
            {
                symbolsContainer ||
                line.content
            }
            { ocrItemBoxVisuals?.text?.sentence_ending_punctuation?.enabled && EOLSymbol }
        </Line>
    </span> )
}