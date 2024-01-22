import { styled } from "@mui/material";
import { OcrResultBoxScalable, OcrTextLineScalable, OcrTextLineSymbolScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import { CSSProperties } from "react";





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
    onBlur?: () => void;
};

export default function OcrResultLine( props: OcrResultLineProps ) {

    const {
        line,
        box,
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

    const Line = styled('span')({
        transformOrigin: 'top left',
        whiteSpace: 'pre',
        width: 'max-content',
        '&::selection': textSelectionStyle,
    });

    const Symbol = styled('span')({
        transformOrigin: 'top left',
        whiteSpace: 'pre',
        textAlign: 'center',
        '&::selection': textSelectionStyle,
    });

    let lineFontSize = 0;

    line?.symbols.map( symbol => {

        const charBoxHeightPx = ( regionHeightPx * ( symbol.box.dimensions.height / 100 ) );
        if ( charBoxHeightPx > lineFontSize )
            lineFontSize = charBoxHeightPx;
    });


    let symbols: JSX.Element[];

    if ( ocrItemBoxVisuals.text.character_positioning && line.symbols.length ) {

        let fontSizeFactor = ocrItemBoxVisuals.text.font_size_factor;

        fontSizeFactor = fontSizeFactor ? fontSizeFactor / 100 : 1;

        lineFontSize = lineFontSize * fontSizeFactor;

        symbols = line?.symbols.map( ( symbol, sIdx ) => {

            // let nextSymbol: OcrTextLineSymbolScalable;
            
            // if ( line?.symbols.length-1 >= sIdx+1 )
            //     nextSymbol = line?.symbols[ sIdx+1 ];
    
            const symbolBoxWidthPx = regionWidthPx * ( symbol.box.dimensions.width / 100 );
            const symbolBoxHeightPx = regionHeightPx * ( symbol.box.dimensions.height / 100 );
    
            let left = symbol.box.position.left - box.position.left;
            let top = symbol.box.position.top - box.position.top;

            let letterSpacing = 1;
            let topOffset = 0;
            let leftOffset = 0;

            // Handle some special characters
            if ( [ '【', '『', '「' ].includes( symbol.symbol ) ) {

                if ( !box.isVertical )
                    leftOffset = -lineFontSize * 0.5;
                else
                    topOffset = -lineFontSize * 0.5;
            }
            
            const leftPx = leftOffset + ( ( left / 100 ) * regionWidthPx ) + ( sizeExpansionPx / 2 );
            const topPx = topOffset + ( ( top / 100 ) * regionHeightPx ) + ( sizeExpansionPx / 2 );
                        
            const lineHeight: string = box.isVertical ? 'unset' : lineFontSize * 1.13 + 'px';
    
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
                        lineHeight: lineHeight,
                        transform: `rotate( ${ symbol.box.angle_degrees }deg )`,
                        border: 'none'
                    }}
                >
                    { symbol.symbol }
                </Symbol>
            )
        });

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
    
    return (
        <Line
            contentEditable={contentEditable}
            onBlur={ ( e ) => {
                line.content = e.target.textContent;
                props?.onBlur();
            }}
            sx={{
                m: props.sizeExpansionPx / 2 + 'px',
                fontSize: lineFontSize ? lineFontSize+'px' : 'inherit'
            }}
        >
            {
                symbolsContainer ||
                line.content
            }
        </Line>
        
    )
}