import { styled, SxProps } from "@mui/material";
import { OcrResultBoxScalable, OcrTextLineScalable, OcrTextLineSymbolScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import { ProfileContext } from "../../context/profile.provider";
import { getBestFontStyle, getDefaultFontFamily, getSymbolPositionOffset, isEolCharacter } from "../../utils/text_utils";
import OcrWordsContainer from "./OcrWordsContainer";
import OcrSymbolsContainer from "./OcrSymbolsContainer";


export type OcrResultLineProps = {
    line: OcrTextLineScalable;
    box: OcrResultBoxScalable; // Text block bounding box
    textBlockBoxWidthPx: number;
    textBlockBoxHeightPx: number;
    regionWidthPx: number;
    regionHeightPx: number;
    sizeExpansionPx: number;
    ocrItemBoxVisuals: OverlayOcrItemBoxVisuals;
    contentEditable: boolean;
    isLastLine: boolean;
    includesGeneratedFurigana: boolean;
    fontFamily?: string;
    onBlur?: () => void;
};




export default function OcrResultLine( props: OcrResultLineProps ) {

    const {
        line,
        box,
        isLastLine,
        textBlockBoxWidthPx,
        textBlockBoxHeightPx,
        regionWidthPx,
        regionHeightPx,
        ocrItemBoxVisuals,
        contentEditable,
        sizeExpansionPx,
        includesGeneratedFurigana,
    } = props;

    const { profile } = useContext( ProfileContext );

    const active_ocr_language = profile?.active_ocr_language;

    const generatedFuriganaSettings = ocrItemBoxVisuals.text?.generated_furigana;

    const textSelectionStyle: CSSProperties = {
        backgroundColor: ocrItemBoxVisuals.selected_text.background_color,
        color: ocrItemBoxVisuals.selected_text.color,
    };

    const containerStyle = {
        '&::selection': textSelectionStyle,
        '& ruby': {
            '::selection': textSelectionStyle
        },
        '&:hover': {
            zIndex: '9000000',
        }
    }

    const fontFamily = props.fontFamily || getDefaultFontFamily( active_ocr_language?.bcp47_tag );

    const Container = styled('span')(containerStyle);

    const Line = styled('div')({
        // transformOrigin: line.box.transform_origin || 'top left',
        whiteSpace: 'pre',
        width: 'max-content',
        fontFamily
    });


    let lineFontSize = 0;
    let fontSizeFactor = ocrItemBoxVisuals?.text.font_size_factor;
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

    const bcp47_tag = active_ocr_language?.bcp47_tag;

    if (
        !([ 'ja-JP', 'zh-Hans', 'zh-Hant', 'yue-Hans', 'yue-Hant' ]
        .some( tag => bcp47_tag === tag ))
    )
        eolSymbol = '.'
    
    const containerTransform = line.box.transform_origin === 'center' ?
        `rotate( ${line.box.angle_radians}rad )` :
        `rotate( ${box.angle_degrees}deg )`;

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
            includesGeneratedFurigana={includesGeneratedFurigana}
            fontFamily={fontFamily}
            style={{
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
            includesGeneratedFurigana={includesGeneratedFurigana}
            fontFamily={fontFamily}
            style={{
                transform: containerTransform,
                fontSize: lineFontSize
            }}
        />
    ) : undefined;
    
    if ( !symbolsContainer && !wordsContainer ) {

        if ( box.isVertical ) {
            [ '．．．', '...', '･･･', '・・・' ]
                .forEach( item => {
                    line.content = line.content?.replaceAll(item, '…' );
                });
        }
        else {
            [ '・・・' ]
                .forEach( item => {
                    line.content = line.content?.replaceAll(item, '...' );
                });
        }

        if ( !lineFontSize && (lineBoxWidthPx || lineBoxHeightPx) ) {
            lineFontSize = box.isVertical ? lineBoxWidthPx : lineBoxHeightPx;
        }

        const getBestFontStyle_input = {
            text: line.content.trim(),
            maxWidth: lineBoxWidthPx,
            maxHeight: lineBoxHeightPx,
            initialFontSize: lineFontSize,
            isVertical: Boolean(box?.isVertical),
            initialSpacing: 0,
            fontFamily,
            fontWeight: ocrItemBoxVisuals.text.font_weight
        }
        
        if ( positioningMode === 'block-based' ) {
            const lineSegments = getBestFontStyle_input.text.split('\u200B');
            let longestSegment = lineSegments[0].trim();

            lineSegments.forEach( segment => {
                if ( segment.trim().length > longestSegment.length )
                    longestSegment = segment;
            });
            getBestFontStyle_input.text = longestSegment;
            getBestFontStyle_input.maxWidth = textBlockBoxWidthPx;
            getBestFontStyle_input.maxHeight = textBlockBoxHeightPx;
        }

        const bestFontStyle = getBestFontStyle(getBestFontStyle_input);
        
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
    let lineBottomPx: number;

    if ( lineTop !== undefined && lineLeft !== undefined ) {
        lineLeftPx = lineLeftOffset + ( ( lineLeft / 100 ) * regionWidthPx );
        lineTopPx = lineTopOffset + ( ( lineTop / 100 ) * regionHeightPx );
        lineBottomPx = textBlockBoxHeightPx - lineTopPx - lineBoxHeightPx;
    }

    const linePositioning = (
        lineTopPx !== undefined &&
        positioningMode !== 'block-based'
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

    if ( box.isVertical ) {
        lineBaseCSS.top = lineTopPx || '0%';
        lineBaseCSS.transformOrigin = line.box.transform_origin || 'top left';
    }
    else {
        lineBaseCSS.bottom = lineBottomPx || '0%';
        lineBaseCSS.transformOrigin = line.box.transform_origin || 'bottom left';
    }

    if ( positioningMode === 'block-based' ) {

        const nLineBreaks = line.content.split('\u200B').length;

        if ( box.isVertical ) {
            lineBaseCSS.maxHeight = textBlockBoxHeightPx + 'px';
            lineBaseCSS.lineHeight = (textBlockBoxWidthPx / nLineBreaks) +'px';
        }
        else {
            lineBaseCSS.maxWidth = textBlockBoxWidthPx;
            lineBaseCSS.lineHeight = (textBlockBoxHeightPx / nLineBreaks) + 'px';
        }
        lineBaseCSS.textAlign = 'left';
    }

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
            // transformOrigin: line.box.transform_origin || 'top left',
        }}>
            {symbolsContainer || line.content}
            { EOLSymbol }
        </span>
    );

    return ( <Container className="ocr-line-container">
        { linePositioning === 'absolute' && lineSizeHolder }
        {
            symbolsContainer ||
            wordsContainer ||
            <Line className="ocr-line"

                contentEditable={contentEditable}
                onBlur={ ( e ) => {
                    line.content = e.target.textContent;
                    props?.onBlur();
                }}
                style={{
                    ...lineBaseCSS,
                    position: linePositioning,
                    left: lineLeftPx || '0%',
                    // transformOrigin: box.transform_origin == 'center' ? 'center' : undefined,
                    // transform: containerTransform,
                    borderRadius: ocrItemBoxVisuals.border_radius,// '0px',
                    // textAlign: box.isVertical ? 'inherit' : 'left',
                    backgroundColor: ocrItemBoxVisuals.background_color,
                    // border: 'solid 1px green'
                }}
            >
                { line.content.trim()
                    .split('\u200B')
                    .flatMap( (part, i, arr) => (
                        i < arr.length - 1
                            ? [part, <wbr key={i} />]
                            : [part]
                    ))
                }
                { ocrItemBoxVisuals?.text?.sentence_ending_punctuation?.enabled && EOLSymbol }
            </Line>
        }
    </Container> )
}