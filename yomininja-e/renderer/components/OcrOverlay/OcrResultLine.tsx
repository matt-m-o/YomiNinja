import { styled } from "@mui/material";
import { OcrResultBoxScalable, OcrTextLineScalable, OcrTextLineSymbolScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { CSSProperties, useContext, useEffect } from "react";
import { ProfileContext } from "../../context/profile.provider";
import { getBestFontStyle, getSymbolPositionOffset, isEolCharacter } from "../../utils/text_utils";
import OcrWordsContainer from "./OcrWordsContainer";
import OcrSymbolsContainer from "./OcrSymbolsContainer";


export type OcrResultLineProps = {
    line: OcrTextLineScalable;
    box: OcrResultBoxScalable; // Text block bounding box
    regionWidthPx: number;
    regionHeightPx: number;
    sizeExpansionPx: number;
    ocrItemBoxVisuals: OverlayOcrItemBoxVisuals;
    contentEditable: boolean;
    isLastLine: boolean;
    onBlur?: () => void;
};




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

    const active_ocr_language = profile?.active_ocr_language;

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

    let lineFontSize = 0;
    let fontSizeFactor = ocrItemBoxVisuals.text.font_size_factor;
    fontSizeFactor = fontSizeFactor ? fontSizeFactor / 100 : 1;
    let lineHeight = lineFontSize;
    const letterSpacingFactor = typeof ocrItemBoxVisuals.text?.letter_spacing_factor === 'number' ?
        ocrItemBoxVisuals.text?.letter_spacing_factor / 100 : 1;
    let letterSpacing = 0;


    const positioningMode = ocrItemBoxVisuals.text?.positioning?.mode;


    if ( line?.symbols?.length ) {
        line?.symbols?.forEach( symbol => {
    
            const charBoxHeightPx = ( regionHeightPx * ( symbol.box.dimensions.height / 100 ) );
            if ( charBoxHeightPx > lineFontSize )
                lineFontSize = charBoxHeightPx;
        });
    }
    else if ( line?.words?.length ) {
        let avg = 0;
        let max = 0;
        line?.words?.forEach( word => {

            const wordBoxHeightPx = ( regionHeightPx * ( word.box.dimensions.height / 100 ) );
            if ( wordBoxHeightPx > max )
                max = wordBoxHeightPx;

            avg += wordBoxHeightPx;
        });

        avg = avg / line.words.length;
        lineFontSize = ( avg + max ) / 2;
    }

    let setLineHeight = true;

    const lineBoxWidthPx = regionWidthPx * ( line?.box?.dimensions.width / 100 );
    const lineBoxHeightPx = regionHeightPx * ( line?.box?.dimensions.height / 100 );

    const lineLeft = line?.box ? line.box?.position.left - box.position.left : undefined;
    const lineTop = line?.box ? line.box?.position.top - box.position.top : undefined;

    let lineTopOffset = 0;
    let lineLeftOffset = 0;

    let eolSymbol = '。';
    let addEolSymbol = false;

    const firstSymbol = line?.content?.[0];
    const lastSymbol = line?.content?.[ line?.content.length - 1 ];

    addEolSymbol = (
        ocrItemBoxVisuals?.text?.sentence_ending_punctuation?.enabled &&
        isLastLine &&
        !isEolCharacter(lastSymbol)
    );

    const EOLSymbolStyle: CSSProperties = {
        color: 'inherit',
    };

    if ( ocrItemBoxVisuals?.text.sentence_ending_punctuation?.hidden ) {
        EOLSymbolStyle.width = '0px';
        EOLSymbolStyle.height = '0px';
        EOLSymbolStyle.color = 'transparent';
        EOLSymbolStyle.position = 'absolute';
    }

    const EOLSymbol = addEolSymbol ? (
        <span
            style={EOLSymbolStyle}
        >
            {eolSymbol}
        </span>
    ) : undefined;

    const { bcp47_tag } = active_ocr_language;

    if (
        !([ 'ja-JP', 'zh-Hans', 'zh-Hant', 'yue-Hans', 'yue-Hant' ]
        .some( tag => bcp47_tag === tag ))
    )
        eolSymbol = '.'


    const symbolsContainer = positioningMode === 'character-based' && line.symbols?.length ? ( 
        <OcrSymbolsContainer
            isVertical={Boolean(box?.isVertical)}
            line={line}
            lineFontSize={lineFontSize}
            lineBoxWidthPx={lineBoxWidthPx}
            lineBoxHeightPx={lineBoxHeightPx}
            ocrItemBoxVisuals={ocrItemBoxVisuals}
            regionWidthPx={regionWidthPx}
            regionHeightPx={regionHeightPx}
            sizeExpansionPx={sizeExpansionPx}
            textBlockBox={box}
            textSelectionStyle={textSelectionStyle}
            isLastLine={isLastLine}
            EOLSymbol={EOLSymbol}
            style={{
                transform: `rotate( ${-box.angle_degrees}deg )`,
                fontSize: lineFontSize
            }}
        />
    ) : undefined;

    const wordsContainer = positioningMode === 'word-based' && line.words?.length ? ( 
        <OcrWordsContainer
            isVertical={Boolean(box?.isVertical)}
            line={line}
            lineFontSize={lineFontSize}
            ocrItemBoxVisuals={ocrItemBoxVisuals}
            regionWidthPx={regionWidthPx}
            regionHeightPx={regionHeightPx}
            sizeExpansionPx={sizeExpansionPx}
            textBlockBox={box}
            textSelectionStyle={textSelectionStyle}
            isLastLine={isLastLine}
            EOLSymbol={EOLSymbol}
            style={{
                transform: `rotate( ${-line.box.angle_degrees}deg )`,
                fontSize: lineFontSize
            }}
        />
    ) : undefined;
    
    if ( !symbolsContainer && !wordsContainer ) {

        if ( box.isVertical ) {
            [ '．．．', '...', '･･･', '・・・' ]
                .forEach( item => {
                    line.content = line.content.replaceAll(item, '…' );
                });
        }
        else {
            [ '・・・' ]
                .forEach( item => {
                    line.content = line.content.replaceAll(item, '...' );
                });
        }

        if ( !lineFontSize && (lineBoxWidthPx || lineBoxHeightPx) ) {
            lineFontSize = box.isVertical ? lineBoxWidthPx : lineBoxHeightPx;
        }
        
        const bestFontStyle = getBestFontStyle({
            text: line.content.trim(),
            maxWidth: lineBoxWidthPx,
            maxHeight: lineBoxHeightPx,
            initialFontSize: lineFontSize,
            isVertical: Boolean(box?.isVertical),
            initialSpacing: 0
        });
        
        lineFontSize = bestFontStyle.fontSize;
        lineFontSize *= fontSizeFactor;
        letterSpacing = bestFontStyle.letterSpacing * letterSpacingFactor;

        // Handle some special characters
        const offsets = getSymbolPositionOffset({
            symbol: firstSymbol,
            fontSize: lineFontSize,
            vertical: box.isVertical,
        });

        lineTopOffset = offsets.topOffset;
        lineLeftOffset = offsets.leftOffset;
    }
    
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
        letterSpacing: letterSpacing+'px'
    };

    const margin = props.sizeExpansionPx / 2 + 'px';

    { ocrItemBoxVisuals?.text?.sentence_ending_punctuation?.enabled && EOLSymbol }

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
            { EOLSymbol }
        </span>
    );

    return ( <span>
        { linePositioning === 'absolute' && lineSizeHolder }
        {
            symbolsContainer ||
            wordsContainer ||
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
                    backgroundColor: ocrItemBoxVisuals.background_color,
                    // border: 'solid 1px green'
                }}
            >
                { line.content.trim()}
                { ocrItemBoxVisuals?.text?.sentence_ending_punctuation?.enabled && EOLSymbol }
            </Line>
        }
    </span> )
}