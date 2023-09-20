import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrItem, OcrResult, OcrResultContextResolution } from "../../electron-src/@core/domain/ocr_result/ocr_result";


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
    ocrResult: OcrResult;
    ocrUIitems: OcrItemUI[];
};

function calculateOcrItemBoxPosition( ocrResultItem: OcrItem, contextResolution: OcrResultContextResolution ): OcrResultBoxPositionPcts {

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

export const OcrResultContext = createContext( {} as OcrResultContextType );


export const OcrResultProvider = ( { children }: PropsWithChildren ) => {

    const [ ocrResult, setOcrResult ] = useState< OcrResult >();
    const [ ocrUIitems, setOcrUIitems ] = useState< OcrItemUI[] >( [] );

  
  
    function ocrResultHandler ( _event, data: OcrResult ) {
        // console.log( data );
        setOcrResult( data );

        data.results.forEach( item => {            

            setOcrUIitems([
                ...ocrUIitems,
                {
                    box_ui: {
                        box_position: calculateOcrItemBoxPosition( item, data.context_resolution )
                    },
                    text: item.text,
                }
            ])
        });

        console.log(ocrUIitems);

    }
    
    useEffect( () => {
        global.ipcRenderer.on( 'ocr:result', ocrResultHandler );
    }, [ global.ipcRenderer ] );
    
    
    return (
        <OcrResultContext.Provider
            value={{
                ocrResult,
                ocrUIitems,
            }}
        >
            {children}
        </OcrResultContext.Provider>
    );
}