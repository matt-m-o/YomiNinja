import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrItem, OcrItemBox, OcrResult, OcrResultContextResolution } from "../../electron-src/@core/domain/ocr_result/ocr_result";


export type OcrResultBoxPositionPcts = {
    top: number;
    left: number;
};

export type OcrResultBoxDimensionsPcts = {
    width: number;
    height: number;
};

// Ocr result box percentages to position, scale and rotate the boxes
export type OcrResultBoxUI = {
    box_position: OcrResultBoxPositionPcts;
    dimensions?: OcrResultBoxDimensionsPcts;    
    angle_degrees?: number;
};

export interface OcrItemUI {
    text: string;
    box_ui: OcrResultBoxUI;
};

export type OcrResultContextType = {
    // ocrResult: OcrResult;
    ocrUIitems: OcrItemUI[];
};

function calculateBoxPosition( ocrResultItem: OcrItem, contextResolution: OcrResultContextResolution ): OcrResultBoxPositionPcts {

    const { width, height } = contextResolution;

    const topLeftXPixels = ocrResultItem.box.top_left.x;
    const position_left = ( 1 - ( ( width - topLeftXPixels ) / width ) ) * 100;

    const topLeftYPixels = ocrResultItem.box.top_left.y;
    const position_top = ( 1 - ( ( height - topLeftYPixels ) / height ) ) * 100;
    
    return {
        left: position_left,
        top: position_top
    }
}

function calculateBoxAngle( verticalDistance: number, horizontalDistance: number ) {    

    verticalDistance = verticalDistance * -1;    

    const negativeRotation = verticalDistance > 0;

    verticalDistance = Math.abs( verticalDistance );
    
    // Ensure height and distance are positive numbers
    if (verticalDistance <= 0 || horizontalDistance <= 0) {
        return null; // Invalid input
    }

    // Calculate the angle in radians
    const radians = Math.atan( verticalDistance / horizontalDistance );

    // Convert radians to degrees
    const degrees = radians * (180 / Math.PI);

    if (negativeRotation)
        return -degrees;

  return degrees;
}

function calculateBoxWidth(
    verticalDistance: number,
    horizontalDistance: number,
    contextResolution: OcrResultContextResolution
) {    

    const topToLeftHypot = Math.hypot( Math.abs(verticalDistance), horizontalDistance ); // Diagonal distance

    const widthPercent = ( topToLeftHypot / contextResolution.width ) * 100;

    return widthPercent || horizontalDistance;
}

function calculateBoxHeight(
    box: OcrItemBox,
    contextResolution: OcrResultContextResolution
) {

    const { top_left, bottom_left } = box;

    const topToBottomVerticalDistance = Math.abs(top_left.y - bottom_left.y);
    // console.log({ topToBottomDistance: topToBottomVerticalDistance })

    const topToBottomHorizontalDistance = Math.abs(top_left.x - bottom_left.x);
    // console.log({ topToBottomHorizontalDistance })

    const topToBottomHypot = Math.hypot( topToBottomVerticalDistance, topToBottomHorizontalDistance ); // Diagonal distance
    // console.log({ topToBottomHypot })

    return ( topToBottomHypot / contextResolution.height ) * 100;   
}

export const OcrResultContext = createContext( {} as OcrResultContextType );


export const OcrResultProvider = ( { children }: PropsWithChildren ) => {

    // const [ ocrResult, setOcrResult ] = useState< OcrResult >();
    const [ ocrUIitems, setOcrUIitems ] = useState< OcrItemUI[] >( [] );
  
  
    function ocrResultHandler ( _event, data: OcrResult ) {
        // console.log( data );        

        const arr: OcrItemUI[] = [];

        data.results.forEach( item => {

            const verticalDistance = item.box.top_right.y - item.box.top_left.y;
            const horizontalDistance = item.box.top_right.x - item.box.top_left.x;
            
            arr.push({
                box_ui: {
                    box_position: calculateBoxPosition( item, data.context_resolution ),
                    angle_degrees: calculateBoxAngle( verticalDistance, horizontalDistance ),
                    dimensions: {
                        width: calculateBoxWidth( verticalDistance, horizontalDistance, data.context_resolution ),
                        height: calculateBoxHeight( item.box, data.context_resolution )
                    }
                },
                text: item.text,
            });
        });
        
        setOcrUIitems(arr);
    }
    
    useEffect( () => {

        global.ipcRenderer.on( 'ocr:result', ocrResultHandler );
        
        global.ipcRenderer.on( 'user_command:clear_overlay', () => {
            setOcrUIitems([]);
        });

    }, [ global.ipcRenderer ] );    
    
    
    return (
        <OcrResultContext.Provider
            value={{
                // ocrResult,
                ocrUIitems,
            }}
        >
            {children}
        </OcrResultContext.Provider>
    );
}