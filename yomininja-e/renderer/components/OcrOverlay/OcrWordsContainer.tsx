import { styled } from "@mui/material";
import { OcrResultBoxScalable, OcrTextLineScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { getBestFontStyle, getSymbolPositionOffset, isEolCharacter } from "../../utils/text_utils";
import { CSSProperties } from "react";


type OcrWordsContainerProps = {
    line: OcrTextLineScalable;
    lineFontSize: number;
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
}

export default function OcrWordsContainer( props: OcrWordsContainerProps ) {

    const {
        line,
        lineFontSize,
        regionWidthPx,
        regionHeightPx,
        isVertical,
        ocrItemBoxVisuals,
        textBlockBox,
        sizeExpansionPx,
        isLastLine,
        textSelectionStyle,
        EOLSymbol
    } = props;

    const Word = styled('span')({
        transformOrigin: 'top left',
        whiteSpace: 'pre',
        textAlign: 'center',
        '&::selection': textSelectionStyle,
    });

    const fontSizeFactor = ocrItemBoxVisuals.text.font_size_factor;

    const words = line?.words.map( ( word, sIdx ) => {

        let isLastWord = line?.words.length - 1 === sIdx;
    
        const wordBoxWidthPx = regionWidthPx * ( word.box.dimensions.width / 100 );
        const wordBoxHeightPx = regionHeightPx * ( word.box.dimensions.height / 100 );

        const bestFontStyle = getBestFontStyle({
            text: word.word,
            maxWidth: wordBoxWidthPx / 100,
            maxHeight: wordBoxHeightPx / 100,
            initialFontSize: textBlockBox.isVertical ? wordBoxWidthPx : wordBoxHeightPx,
            initialSpacing: 0,
            isVertical: textBlockBox.isVertical
        });
        
        let fontSize = bestFontStyle.fontSize * fontSizeFactor;

        const left = word.box.position.left - textBlockBox.position.left;
        const top = word.box.position.top - textBlockBox.position.top;

        // Handle some special characters
        const { topOffset, leftOffset } = getSymbolPositionOffset({
            symbol: word.word,
            fontSize: fontSize,
            vertical: textBlockBox.isVertical,
        });
        
        const leftPx = leftOffset + ( ( left / 100 ) * regionWidthPx ) + ( sizeExpansionPx / 2 );
        const topPx = topOffset + ( ( top / 100 ) * regionHeightPx ) + ( sizeExpansionPx / 2 );

        if ( fontSize < lineFontSize * 0.90 && word.word.length === 1)
            fontSize = (fontSize + lineFontSize) / 2; //  * 0.95;
        
        return (
            <Word key={sIdx}
                style={{
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    width: wordBoxWidthPx + 'px',
                    height: wordBoxHeightPx + 'px',
                    left: leftPx + 'px',
                    top: topPx + 'px',
                    fontSize: fontSize + 'px',
                    letterSpacing: bestFontStyle.letterSpacing + 'px',
                    lineHeight: textBlockBox.isVertical ? 'unset' : fontSize + 'px',
                    transform: `rotate( ${ word.box.angle_degrees }deg )`,
                    // border: 'none',
                    // border: 'solid 2px red',
                }}
            >
                { word.word }
                { isLastWord && EOLSymbol }
            </Word>
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
            {words}
        </span>
    )
}