import { Box, Container, InputBaseComponentProps, SxProps, TextField, Theme, Typography } from "@mui/material";
import { Dispatch, SetStateAction, KeyboardEvent, MouseEvent } from "react";
import AddSharpIcon from '@mui/icons-material/AddSharp';

const modifierKeys: string[] = [
    'Command', 'Cmd',
    'Control', 'Ctrl',
    'CommandOrControl',
    'Alt',
    'Option',
    'AltGr', 'AltGraph',
    'Shift',
    'Super',
    'Meta'
];
function isModifierKey( key: string ): boolean {
    return modifierKeys.includes( key );
}

function capitalize( str: string ): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEventKeys( event: KeyboardEvent ): string[] {

    const { key } = event;

    const keys = [];

    // if ( isModifierKey( key ) )
    //     return keys;

    if ( event.metaKey )
        keys.push('Meta');

    if ( event.ctrlKey )
        keys.push('Ctrl');

    if ( event.altKey )
        keys.push('Alt');

    if ( event.shiftKey )
        keys.push('Shift');


    if ( !isModifierKey( key ) )
        keys.push( capitalize( key ) );

    return keys;
}

export interface HotkeyCombination {
    modifierKey?: string;
    key: string;
}


export type HotkeyFieldsProps = {
    title: string;
    keyCombination: string;
    onChangeHandler: ( input?: string[] ) => void; // Dispatch<SetStateAction<HotkeyCombination>>;
    sx?: SxProps<Theme>;
};

// Inputs component
export default function HotkeyFields( props: HotkeyFieldsProps) {

    const {
        keyCombination,
        onChangeHandler,
        title,
        sx
    } = props;

    function keyDownHandler( event: KeyboardEvent ) {

        const keys = getEventKeys( event );

        console.log( keys );

        if ( keys.length === 0 )
            return;

        onChangeHandler(keys);        
        
        // console.log( hotkeyCombinationState );
    }

    function mouseDownHandler( event: MouseEvent ) {

        const { button } = event;

        // Ignoring Left and Right click
        if ( [ 0, 2 ].includes( button ) )
            return;
        
        onChangeHandler([ 'Mouse ' + button ]);
    }

    return (        
        <Container sx={{ mt: 2, mb: 2, ...sx }}>

            <Typography gutterBottom component="div" margin={0} ml={0}>
                { title }
            </Typography>

            <Box sx={{ display: 'flex', direction: 'row', alignItems: 'center', ml: '14px' }}>

                <TextField sx={{ maxWidth: '248px', margin: 1 }}
                    size='small'
                    inputProps={{ style: { textAlign: 'center' } }}
                    required                    
                    value={ keyCombination }
                    
                    onKeyDown={ keyDownHandler }
                    onMouseDown={ mouseDownHandler }
                />
                
            </Box>

        </Container>
    )
}

