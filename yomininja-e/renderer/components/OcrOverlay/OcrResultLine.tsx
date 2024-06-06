import { styled } from "@mui/material";
import { OcrResultBoxScalable, OcrTextLineScalable, OcrTextLineSymbolScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { CSSProperties } from "react";


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

    let eolSymbol = '';


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
                eolSymbol = '。';
    
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

        if ( !lineFontSize ) {
            lineFontSize = box.isVertical ? lineBoxWidthPx : lineBoxHeightPx;
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
            eolSymbol = '。';
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

    const lineBaseCSS: CSSProperties = {
        minWidth: lineBoxWidthPx,
        minHeight: lineBoxHeightPx,
        writingMode: box?.isVertical ? 'vertical-rl' :'inherit',
        textOrientation: box?.isVertical ? 'upright' :'inherit',
        fontSize: lineFontSize ? lineFontSize+'px' : 'inherit',
        lineHeight: setLineHeight && lineFontSize ? lineFontSize+'px' : 'inherit',
        margin: props.sizeExpansionPx / 2 + 'px',
    };

    const margin = props.sizeExpansionPx / 2 + 'px';

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
        </span>
    );

    const EOLSymbol = <span
        style={{
            width: '0px',
            height: '0px',
            color: 'transparent',
            position: 'absolute'
        }}>
            {eolSymbol}
    </span>

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
                borderRadius: '0px',
                textAlign: box.isVertical ? 'inherit' : 'left',
                backgroundColor: ocrItemBoxVisuals.background_color
            }}
        >
            {
                symbolsContainer ||
                line.content
            }
            {EOLSymbol}
        </Line>
    </span> )
}