import { useContext, useEffect } from "react";
import { OcrItemUI, OcrResultContext } from "../context/ocr_result.provider";
import { styled } from "@mui/material";


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

    const { ocrUIitems } = useContext( OcrResultContext );
    
    function createOcrResultBox( item: OcrItemUI, idx: number ): JSX.Element {

        const { box_ui } = item;

        return (
            <OcrResultBox key={idx}
                sx={{
                    left: box_ui.box_position.left + '%',
                    top: box_ui.box_position.top + '%',
                    transform: `rotate( ${box_ui.angle_degrees}deg )`,
                    minWidth: box_ui.dimensions.width + '%',
                    minHeight: box_ui.dimensions.height + '%',
                    fontSize: box_ui.dimensions.height * 45 + '%',
                }}
            >
                { item.text }
            </OcrResultBox>
        )
    }

    useEffect( () => {
        // console.log( ocrUIitems );        
    }, [ ocrUIitems ] );

    return (
        <>
            { ocrUIitems?.map( createOcrResultBox ) }        
        </> 
    );
}