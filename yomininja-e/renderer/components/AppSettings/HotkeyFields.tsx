import { Box, InputBaseComponentProps, TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import AddSharpIcon from '@mui/icons-material/AddSharp';

export interface HotkeyCombination {
    modifierKey: string;
    key: string;
}


export type HotkeyFieldsProps = {
    hotkeyCombinationState: HotkeyCombination;
    setStateAction: Dispatch<SetStateAction<HotkeyCombination>>;
};

// Inputs component
export default function HotkeyFields( props: HotkeyFieldsProps) {

    const { hotkeyCombinationState, setStateAction } = props;

    function keyDownHandler(
        { key }: React.KeyboardEvent,
        type: 'modifierKey' | 'key',
    ) {

        if ( key.length == 1 )
            key = key.toUpperCase();
        
        if ( type == 'modifierKey' )
            setStateAction({ ...hotkeyCombinationState, modifierKey: key });

        else if ( type === 'key' )
            setStateAction({ ...hotkeyCombinationState, key: key });
        
        console.log( hotkeyCombinationState );
    }

    const hotkeyInputProps: InputBaseComponentProps = {
        style: { textAlign: 'center' }
    };

    return (
        <Box sx={{ display: 'flex', direction: 'row', alignItems: 'center' }}>
        
            <TextField sx={{ maxWidth: 80, margin: 1 }}
                inputProps={hotkeyInputProps}
                required                    
                value={ hotkeyCombinationState?.modifierKey || '' }
                
                onKeyDown={ ( event ) => keyDownHandler(
                    event, 'modifierKey'
                )}
            />

            <AddSharpIcon/>

            <TextField sx={{ maxWidth: 80, margin: 1 }}
                inputProps={{ style: { textAlign: 'center' } }}
                required                    
                value={ hotkeyCombinationState?.key || '' }
                
                onKeyDown={ ( event ) => keyDownHandler(
                    event, 'key'
                )}
            />

        </Box>
    )
}