import { Box, Slider, Stack, styled, Typography } from "@mui/material";
import ResetParameterButton from "./common/ResetParameterButton";

export const MainDiv = styled( `div` )({
    marginTop: 25,
    marginBottom: 25,
    '&:hover': {
        '& .reset-parameter-btn': {
            visibility: 'visible !important'
        }
    }
});

type OcrSettingsSliderProps = {
    label: string;
    leftLabel?: string;
    rightLabel?: string;
    title?: string;
    icon?: JSX.Element;
    marks?: boolean;
    value: number;
    min: number;
    max: number;
    step: number;
    disabled?: boolean;
    onChange: ( ...value: any ) => void;
    onChangeCommitted: () => void;
    reset?: () => void;
}

export default function OcrSettingsSlider( props: OcrSettingsSliderProps ) {

    const {
        icon,
        marks,
        label,
        leftLabel,
        rightLabel,
        title,
        value,
        min,
        max,
        step,
        reset: setDefault
    } = props;

    return (
        <MainDiv>
            <Box display='flex' flexDirection='row' alignItems='center'>
                <Typography gutterBottom component="div" margin={1} ml={0} mr={0.4} fontSize={'1.1rem'} title={title}>
                    {label}
                </Typography>
                {icon}

                { setDefault &&
                    <ResetParameterButton
                        onClick={ () => {
                            if ( setDefault ) setDefault();
                        }}
                        disabled={props?.disabled}
                    />
                }
            </Box>

            <Stack spacing={2} direction="row" sx={{ mb: 1, pl: 2, pr: 0 }} alignItems="center">

                <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                    {leftLabel}
                </Typography>

                <Slider marks={marks} min={min} max={max} step={step}
                    value={ value }
                    valueLabelDisplay="auto"
                    style={{ marginRight: 8 }}                
                    onChange={ props.onChange }
                    onChangeCommitted={ props.onChangeCommitted }
                    disabled={ props.disabled }
                />

                <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                    {rightLabel}
                </Typography>
            
            </Stack>
        </MainDiv>
    )
}