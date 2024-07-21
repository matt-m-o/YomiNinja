import { Box, Button } from "@mui/material";
import { CSSProperties } from "react";


type ResetParameterButtonProps = {
    onClick: () => void;
    boxStyle?: CSSProperties;
    buttonStyle?: CSSProperties;
    disabled?: boolean;
};

export default function ResetParameterButton( props: ResetParameterButtonProps ) {

    return (
        <Box className='reset-parameter-btn'
            title='Reset value' 
            display='flex'
            alignItems='center'
            ml={1}
            style={{
                visibility: 'hidden',
                ...props.boxStyle
            }}
        >
            <Button
                size="small"
                variant="outlined"
                onClick={ props.onClick }
                disabled={props?.disabled}
                style={{
                    borderRadius: '1000px',
                    textTransform: 'none',
                    ...props.buttonStyle,
                }}
            >
                Reset
            </Button>
        </Box>
    )
}