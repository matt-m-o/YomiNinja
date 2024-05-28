import { Box, Button, Container, InputBaseComponentProps, SxProps, TextField, Theme, Typography } from "@mui/material";
import { Dispatch, SetStateAction, KeyboardEvent, MouseEvent, CSSProperties, ReactNode } from "react";
import AddSharpIcon from '@mui/icons-material/AddSharp';
import BackspaceRoundedIcon from '@mui/icons-material/BackspaceRounded';
import IconButton from '@mui/material/IconButton';


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
    label: string;
    title?: string;
    keyCombination: string;
    onChangeHandler: ( input?: string[] ) => void; // Dispatch<SetStateAction<HotkeyCombination>>;
    sx?: CSSProperties;
    children?: ReactNode;
};

// Inputs component
export default function HotkeyFields( props: HotkeyFieldsProps) {

    const {
        keyCombination,
        onChangeHandler,
        label,
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
        <dl title={title}
            style={{
                display: 'table-row',
                ...sx
            }}
        >
            <dt
                style={{
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'right',
                    minWidth: '80px',
                    maxWidth: '80px'
                }}
            >
                <Typography
                    gutterBottom
                    component="div"
                    margin={0}
                    ml={0}
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'right'
                    }}
                >
                    { label }
                </Typography>
            </dt>
            
            <dd
                style={{
                    // width: '100%',
                    display: 'table-cell',
                    verticalAlign: 'middle'
                }}
            >
                <Box sx={{ display: 'flex', direction: 'row', alignItems: 'center', ml: '14px' }}>

                    <TextField 
                        // label={title}
                        size='small'
                        inputProps={{
                            style: { textAlign: 'center' },
                        }}
                        value={ keyCombination }
                        
                        onKeyDown={ keyDownHandler }
                        onMouseDown={ mouseDownHandler }

                        sx={{
                            width: '100%',
                            minWidth: '350px',
                            margin: 1
                        }}
                    />

                    <Button variant="text"
                        onClick={ () => onChangeHandler([]) }
                        style={{
                            minWidth: '40px',
                        }}
                    >
                        <BackspaceRoundedIcon 
                            style={{
                                width: '25px',
                                height: '25px'
                            }}
                        />
                    </Button>
                </Box>
            </dd>

            {/* <dd
                style={{
                    width: '100%',
                    display: 'table-cell',
                    verticalAlign: 'middle'
                }}
            >
                <Button variant="text"
                    onClick={ () => onChangeHandler([]) }
                    style={{
                        minWidth: '40px',
                    }}
                >
                    <BackspaceRoundedIcon 
                        style={{
                            width: '25px',
                            height: '25px'
                        }}
                    />
                </Button>
            </dd> */}

        </dl>
    )
}

