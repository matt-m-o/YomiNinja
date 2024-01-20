import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, SxProps, Theme } from "@mui/material";
import { ChangeEvent, useState } from "react";

export type PasswordFieldProps = {
    label: string;
    value: string;
    onChange: ( event: ChangeEvent< HTMLInputElement > ) => void;
    sx?: SxProps<Theme>;
    required?: boolean;
}

export default function PasswordField( props: PasswordFieldProps ) {

    const { label, value, sx, required } = props;

    const [ showPassword, setShowPassword ] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };


    return (
        <FormControl sx={{ m: 1, width: '100%' }} >
            <InputLabel htmlFor="filled-adornment-password" required={required}>
                { label }
            </InputLabel>
            <OutlinedInput
                label={ label }
                id="filled-adornment-password"
                type={ showPassword ? 'text' : 'password' }
                required={required}
                value={ value }
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={ handleClickShowPassword}
                            onMouseDown={ handleMouseDownPassword }
                            edge="end"
                        >
                            { showPassword ? <VisibilityOff /> : <Visibility /> }
                        </IconButton>
                    </InputAdornment>
                }
                onChange={ props.onChange }
                sx={sx}
            />
        </FormControl>
    )
}