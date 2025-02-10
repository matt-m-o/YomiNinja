import { styled, SxProps } from "@mui/material";
import { OcrResultBoxScalable, OcrTextLineScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { getBestFontStyle, getSymbolPositionOffset, getSymbolSpacingSide, isEolCharacter } from "../../utils/text_utils";
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
    includesGeneratedFurigana: boolean;
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
        EOLSymbol,
        includesGeneratedFurigana
    } = props;

    const Word = styled('span')({
        transformOrigin: 'top left',
        whiteSpace: 'pre',
        textAlign: 'center',
        '&::selection': textSelectionStyle,
    });

    const fontSizeFactor = ocrItemBoxVisuals?.text.font_size_factor;
    const letterSpacingFactor = typeof ocrItemBoxVisuals.text?.letter_spacing_factor === 'number' ?
        ocrItemBoxVisuals.text?.letter_spacing_factor / 100 : 1;

    const words = line?.words.map( ( word, sIdx ) => {

        let isLastWord = line?.words.length - 1 === sIdx;
        const includesRightSpacing = word.word.length === 1 && getSymbolSpacingSide( word.word ) == 'right';
        // const includesLeftSpacing = word.word.length === 1 && getSymbolSpacingSide( word.word ) == 'left';
    
        const wordBoxWidthPx = regionWidthPx * ( word.box.dimensions.width / 100 );
        const wordBoxHeightPx = regionHeightPx * ( word.box.dimensions.height / 100 );

        const bestFontStyle = getBestFontStyle({
            text: word.word.trim(),
            maxWidth: wordBoxWidthPx / 100,
            maxHeight: wordBoxHeightPx / 100,
            initialFontSize: textBlockBox.isVertical ? wordBoxWidthPx : wordBoxHeightPx,
            initialSpacing: 0,
            isVertical: isVertical
        });
        
        let fontSize = bestFontStyle.fontSize * fontSizeFactor;
        const letterSpacing = bestFontStyle.letterSpacing * letterSpacingFactor;

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
        const bottomPx = ( ( top / 100 ) - topPx - wordBoxHeightPx ) ;

        if ( fontSize < lineFontSize * 0.90 && word.word.length === 1)
            fontSize = (fontSize + lineFontSize) / 2; //  * 0.95;


        const transform = word?.box.transform_origin === 'center' ?
            `rotate( ${word.box.angle_radians}rad )` :
            `rotate( ${word.box.angle_degrees}deg )`;


        const style: SxProps = {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: wordBoxWidthPx + 'px',
            left: leftPx + 'px',
            fontSize: fontSize + 'px',
            letterSpacing: letterSpacing + 'px',
            lineHeight: textBlockBox.isVertical ? 'unset' : fontSize + 'px',
            transform,
            // border: 'none',
            // border: 'solid 2px red',
            "&:hover": {
                backgroundColor: ocrItemBoxVisuals?.background_color
            }
        };

        
        
        if ( textBlockBox.isVertical ) {
            style.top = topPx ? topPx+'px' : '0%';
            style.height = wordBoxHeightPx + 'px';
            style.transformOrigin = line?.box.transform_origin || 'top left';
        }
        else {
            style.minHeight = wordBoxHeightPx + 'px';
            style.bottom = bottomPx ? bottomPx : '0%';
            style.transformOrigin = line?.box.transform_origin || 'bottom left';
        }

        if ( includesRightSpacing )
            style.justifyContent = 'left';
        
        return (
            <Word key={sIdx}
                style={style}
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