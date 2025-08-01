import { styled } from "@mui/material";
import { OcrResultBoxScalable, OcrTextLineScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { getBestFontStyle, getSymbolPositionOffset, isEolCharacter } from "../../utils/text_utils";
import { CSSProperties } from "react";


type OcrSymbolsContainerProps = {
    line: OcrTextLineScalable;
    lineFontSize: number;
    lineBoxWidthPx: number,
    lineBoxHeightPx: number,
    regionWidthPx: number;
    regionHeightPx: number;
    isVertical: boolean;
    ocrItemBoxVisuals: OverlayOcrItemBoxVisuals;
    textBlockBox: OcrResultBoxScalable;
    sizeExpansionPx: number;
    isLastLine?: boolean;
    textSelectionStyle: CSSProperties;
    style?: CSSProperties;
    EOLSymbol?: JSX.Element;
    includesGeneratedFurigana: boolean;
}

export default function OcrSymbolsContainer( props: OcrSymbolsContainerProps ) {

    const {
        line,
        lineBoxWidthPx,
        lineBoxHeightPx,
        regionWidthPx,
        regionHeightPx,
        isVertical,
        ocrItemBoxVisuals,
        textBlockBox,
        sizeExpansionPx,
        isLastLine,
        textSelectionStyle,
        EOLSymbol,
        includesGeneratedFurigana
    } = props;

    let {
        lineFontSize
    } = props;

    const Symbol = styled('span')({
        transformOrigin: 'top left',
        whiteSpace: 'pre',
        textAlign: 'center',
        '&::selection': textSelectionStyle,
    });

    const fontSizeFactor = ocrItemBoxVisuals?.text.font_size_factor;
    const letterSpacingFactor = typeof ocrItemBoxVisuals.text?.letter_spacing_factor === 'number' ?
        ocrItemBoxVisuals.text?.letter_spacing_factor / 100 : 1;

    const bestFontStyle = getBestFontStyle({
        text: line.content,
        maxWidth: lineBoxWidthPx / 100,
        maxHeight: lineBoxHeightPx / 100,
        initialFontSize: lineFontSize,
        isVertical: Boolean(textBlockBox?.isVertical)
    });
    lineFontSize = bestFontStyle.fontSize;
    lineFontSize = lineFontSize * fontSizeFactor;
    const letterSpacing = bestFontStyle.letterSpacing * letterSpacingFactor;

    const symbols = line?.symbols.map( ( symbol, sIdx ) => {

        const isLastSymbol = line?.symbols.length - 1 === sIdx;

        // let nextSymbol: OcrTextLineSymbolScalable;
            
        // if ( line?.symbols.length-1 >= sIdx+1 )
        //     nextSymbol = line?.symbols[ sIdx+1 ];
    
        const symbolBoxWidthPx = regionWidthPx * ( symbol.box.dimensions.width / 100 );
        const symbolBoxHeightPx = regionHeightPx * ( symbol.box.dimensions.height / 100 );

        let left = symbol.box.position.left - textBlockBox.position.left;
        let top = symbol.box.position.top - textBlockBox.position.top;

        

        // Handle some special characters
        const { topOffset, leftOffset } = getSymbolPositionOffset({
            symbol: symbol.symbol,
            fontSize: lineFontSize,
            vertical: textBlockBox.isVertical,
        });

        const leftPx = leftOffset + ( ( left / 100 ) * regionWidthPx ) + ( sizeExpansionPx / 2 );
        const topPx = topOffset + ( ( top / 100 ) * regionHeightPx ) + ( sizeExpansionPx / 2 );
        const bottomPx = ( ( top / 100 ) - topPx - symbolBoxHeightPx ) ;


        const style: CSSProperties = {
            position: 'absolute',
            width: symbolBoxWidthPx + 'px',
            left: leftPx + 'px',
            fontSize: lineFontSize + 'px',
            letterSpacing: letterSpacing + 'px',
            lineHeight: textBlockBox.isVertical ? 'unset' : lineFontSize + 'px',
            transform: `rotate( ${ symbol.box.angle_degrees }deg )`,
            // border: 'none',
            // border: 'solid 2px red',
        }

        if ( textBlockBox.isVertical ) {
            style.top = topPx || '0%';
            style.height = symbolBoxHeightPx + 'px';
        }
        else {
            style.bottom = bottomPx || '0%';
            style.minHeight = symbolBoxHeightPx + 'px';
        }
        
        return (
            <Symbol key={sIdx}
                style={style}
            >
                { symbol.symbol }
                { isLastSymbol && EOLSymbol }
            </Symbol>
        )
    });


    return (
        <span
            style={{
                position: 'absolute',
                left: '0px',
                top: '0px',
                ...props.style,
            }}
        >
            {symbols}
        </span>
    )
}