import { useContext, useEffect } from "react";
import { OcrResultContext } from "../context/ocr_result.provider";
import { styled } from "@mui/material";
import { OcrItem } from "../../electron-src/@core/domain/ocr_result/ocr_result";


const OcrResultBox = styled('div')({
    border: 'solid 1px red',
    borderRadius: '20px',
    display: 'flex',
    position: 'absolute',
    // color: 'transparent',
    fontSize: '1.5rem',    
    transformOrigin: 'top left',
    padding: '0px',
    margin: '0px',    
});

export default function FullscreenOcrResult() {

    const { ocrResult } = useContext( OcrResultContext );
    
    function createOcrResultBox( item: OcrItem, idx: number ): JSX.Element {

        const { box } = item;

        return (
            <OcrResultBox key={idx}
                sx={{
                    left: box.top_left.x + 'px',
                    top: box.top_left.y + 'px'
                }}
            >
                { item.text }
            </OcrResultBox>
        )
    }

    useEffect( () => {
        console.log( ocrResult );        
    }, [ ocrResult ] );

    return (
        <>
            { ocrResult?.results?.map( createOcrResultBox ) }        
        </> 
    );
}