import { Box, Slider, Stack, Typography } from "@mui/material";

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
    onChange: ( ...value: any ) => void;
    onChangeCommitted: () => void;
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
    } = props;

    return <>
        <Box display='flex' flexDirection='row' alignItems='center'>
            <Typography gutterBottom component="div" margin={1} ml={0} mr={0.4} fontSize={'1.1rem'} title={title}>
                {label}
            </Typography>
            {icon}
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
            />

            <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                {rightLabel}
            </Typography>

        </Stack>
    </>
}