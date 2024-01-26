import { CircularProgress, styled } from "@mui/material";
import { CSSProperties, useEffect } from "react";


const ProgressContainer = styled('div')({
    position: 'absolute',
    right: '2%',
    bottom: '2.5%'
});
  
type ProcessingIndicatorProps = {
    size?: string;
    color: string;
    style?: CSSProperties;
};

export default function ProcessingIndicator( props: ProcessingIndicatorProps ) {

    let circularProgressSize = 35;

    useEffect( () => {
        circularProgressSize = window.innerWidth * 0.03;

        if ( circularProgressSize < 35 )
        circularProgressSize = 35;
    }, [] )
    

    return (
        <ProgressContainer style={props.style}>
            <CircularProgress 
                size={ props?.size ? props.size : circularProgressSize + 'px' }
                sx={{
                    color: props.color
                }}
            />
        </ProgressContainer>
    )
}