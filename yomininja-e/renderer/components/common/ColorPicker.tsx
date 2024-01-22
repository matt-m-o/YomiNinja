import { SxProps, TextField, Theme, styled } from '@mui/material';
import React, { CSSProperties, useState } from 'react'
import { ChromePicker, ColorResult, RGBColor  } from 'react-color'

const Container = styled('div')({
    position: 'relative',
    display: 'inline-block',
    '& .chrome-picker': {
        position: 'absolute',
        zIndex: 99999
    }
});

const Popover = styled('div')({
    position: 'absolute',
    zIndex: 9999,
    '& input': {
        backgroundColor: 'white'
    }
});

export type ColorPickerProps = {
    value: string;
    label: string;
    onChangeComplete: ( color: string ) => void;
    sx: SxProps< Theme >;
}

export default function ColorPicker( props: ColorPickerProps ) {

    const { value, label, sx } = props;

    const [ visible, setVisible ] = useState( false );
    const [ color, setColor ] = useState< string >(value);

    const handleClick = () => {
        setVisible( !visible )
    };

    const handleClose = () => {
        setVisible( false)
    };

    const cover: CSSProperties = {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
    }

    const handleChangeComplete = ( color: ColorResult ) => {

        const hexAlpha = rgbAlphaToHexAlpha( color.rgb );

        setColor( color.hex+hexAlpha );

        props.onChangeComplete( color.hex+hexAlpha );
    }

    const handleChange = ( color: ColorResult ) => {
        const hexAlpha = rgbAlphaToHexAlpha( color.rgb );
        setColor( color.hex + hexAlpha );
    }

    function rgbAlphaToHexAlpha( rgba: RGBColor ): string {

        const alpha = Math.round( rgba.a * 255 )
            .toString( 16 )
            .toUpperCase()
            .padStart( 2, '0' );

        return alpha;
    }

    function getHexWithoutAlpha( hex: string ) {
        return hex.slice(0, 7);
    }

    const input = (
        <Container id='container'>
            <TextField label={label} sx={sx}                      
                size='small'
                type="color"
                inputProps={{ style: { textAlign: 'center' } }}                        
                value={ getHexWithoutAlpha( color ) }
                onClick={ ( e ) => { 
                    e.preventDefault();
                    handleClick();
                }}
            />
            { visible && 
                <Popover id='popover'>
                    <div style={ cover } onClick={ handleClose }/>
                    <ChromePicker
                        color={ color }
                        onChangeComplete={ handleChangeComplete }
                        onChange={ handleChange }
                    />
                </Popover>
            }
        </Container>
    );

    // const inputOld = (
    //     <FormControl sx={{ width: '95px' }} >
    //         <InputLabel htmlFor="outlined-adornment-amount">
    //             Inactive BG
    //         </InputLabel>
    //         <OutlinedInput
    //             id="outlined-adornment-amount"
    //             type='color'
    //             label="Inactive BG"
    //             value={ getHexWithoutAlpha( color ) } // {color}
    //             onClick={ ( e ) => { 
    //                 e.preventDefault();
    //                 handleClick();
    //             }}
    //             size='small'
    //         />
    //         { visible && 
    //             <Popover >
    //                 <div style={ cover } onClick={ handleClose }/>
    //                 <ChromePicker
    //                     color={ color }
    //                     onChangeComplete={ handleChangeComplete }
    //                     onChange={ handleChange }
    //                 />
    //             </Popover>
    //         }
    //     </FormControl>
    // );

    return input;
}
