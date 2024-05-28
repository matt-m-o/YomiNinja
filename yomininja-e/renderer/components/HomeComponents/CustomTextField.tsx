import { FormControlLabel, SxProps, TextField, TextFieldProps, Theme } from "@mui/material";

export type CustomTextFieldProps = {
    label?: string;
    sx?: SxProps< Theme > ;
} & TextFieldProps;

export default function CustomTextField( props: CustomTextFieldProps ) {
    return (
        <FormControlLabel label={props.label}
            sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'start',
            }}
            labelPlacement="top"
            control={
                <TextField {...props } label=''
                    fullWidth 
                    sx={props?.sx}
                />
            }
        />
    )
}