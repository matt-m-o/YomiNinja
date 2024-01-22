import { styled } from "@mui/material";
import { OcrResultBoxScalable, OcrTextLineScalable, OcrTextLineSymbolScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";



const Line = styled('span')({
    transformOrigin: 'top left',
    whiteSpace: 'pre',
    width: 'max-content',
    // '&::selection': {
    //     backgroundColor: 'red',
    //     color: 'black'
    // }
});

const SymbolsContainer = styled('span')({
    position: 'absolute',
    left: '0px',
    top: '0px'
});

const Symbol = styled('span')({
    transformOrigin: 'top left',
    whiteSpace: 'pre',
    textAlign: 'center',
    // '&::selection': {
    //     backgroundColor: 'red',
    //     color: 'black'
    // }
});

export type OcrResultLineProps = {
    line: OcrTextLineScalable;
    box: OcrResultBoxScalable;
    regionWidthPx: number;
    regionHeightPx: number;
    symbolPositioning: boolean;
    contentEditable: boolean;
    fontSizeFactor: number;
    onBlur?: () => void;
};

export default function OcrResultLine( props: OcrResultLineProps ) {

    const {
        line,
        box,
        regionWidthPx,
        regionHeightPx,
        symbolPositioning,
        contentEditable,
    } = props;

    let lineFontSize = 0;

    line?.symbols.map( symbol => {

        const charBoxHeightPx = ( regionHeightPx * ( symbol.box.dimensions.height / 100 ) );
        if ( charBoxHeightPx > lineFontSize )
            lineFontSize = charBoxHeightPx;
    });


    let symbols: JSX.Element[];

    if ( symbolPositioning && line.symbols.length ) {

        const fontSizeFactor = props?.fontSizeFactor ? props.fontSizeFactor / 100 : 1;
        lineFontSize = lineFontSize * fontSizeFactor;

        symbols = line?.symbols.map( ( symbol, sIdx ) => {

            // let nextSymbol: OcrTextLineSymbolScalable;
            
            // if ( line?.symbols.length-1 >= sIdx+1 )
            //     nextSymbol = line?.symbols[ sIdx+1 ];
    
            const symbolBoxWidthPx = regionWidthPx * ( symbol.box.dimensions.width / 100 );
            const symbolBoxHeightPx = regionHeightPx * ( symbol.box.dimensions.height / 100 );
    
            let left = ( symbol.box.position.left - box.position.left ) + 0.25;
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
            
            const leftPx = leftOffset + ( ( left / 100 ) * regionWidthPx );
            const topPx = topOffset + ( ( top / 100 ) * regionHeightPx );
                        
            
    
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
                        lineHeight: lineFontSize * 1.10 + 'px',
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