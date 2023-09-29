import { Box, Container, InputBaseComponentProps, SxProps, TextField, Theme, Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
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


export interface HotkeyCombination {
    modifierKey?: string;
    key: string;
}


export type HotkeyFieldsProps = {
    title: string;
    hotkeyCombinationState: HotkeyCombination;
    setStateAction: Dispatch<SetStateAction<HotkeyCombination>>;
    sx?: SxProps<Theme>;
};

// Inputs component
export default function HotkeyFields( props: HotkeyFieldsProps) {

    const {
        hotkeyCombinationState,
        setStateAction,
        title,
        sx
    } = props;

    function keyDownHandler(
        { key }: React.KeyboardEvent,
        type: 'modifierKey' | 'key',
    ) {

        if ( type != 'modifierKey' && isModifierKey(key) )
            return;

        if ( key.length == 1 )
            key = key.toUpperCase();

        
        if ( type == 'modifierKey' && isModifierKey(key) ) 
            setStateAction({ ...hotkeyCombinationState, modifierKey: key });        

        else if ( type === 'key' )
            setStateAction({ ...hotkeyCombinationState, key: key });
        
        console.log( hotkeyCombinationState );
    }

    const hotkeyInputProps: InputBaseComponentProps = {
        style: { textAlign: 'center' }
    };

    return (        
        <Container sx={{ mt: 2, mb: 2, ...sx }}>

            <Typography gutterBottom component="div" margin={0} ml={0}>
                { title }
            </Typography>

            <Box sx={{ display: 'flex', direction: 'row', alignItems: 'center', ml: '14px' }}>
                
                { hotkeyCombinationState?.modifierKey != 'undefined' && <>
                    
                    <TextField sx={{ maxWidth: '124px', margin: 1 }}
                        size='small'
                        inputProps={hotkeyInputProps}
                        required                    
                        value={ hotkeyCombinationState?.modifierKey || '' }
                        
                        onKeyDown={ ( event ) => keyDownHandler(
                            event, 'modifierKey'
                        )}
                    />

                    <AddSharpIcon/>
                    
                </> }


                <TextField sx={{ maxWidth: '124px', margin: 1 }}
                    size='small'
                    inputProps={{ style: { textAlign: 'center' } }}
                    required                    
                    value={ hotkeyCombinationState?.key || '' }
                    
                    onKeyDown={ ( event ) => keyDownHandler(
                        event, 'key'
                    )}
                />
                
            </Box>

        </Container>
    )
}

