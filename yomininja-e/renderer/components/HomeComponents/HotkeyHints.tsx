import { Box, Container, Grid, Paper, Typography, styled } from "@mui/material";
import { useContext, useEffect } from "react";
import { SettingsContext } from "../../context/settings.provider";
import { OverlayHotkeys } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";

const KeyActionText = styled( Typography )({
    width: '65%',
    padding: 5,
    paddingLeft: 8,
    paddingRight: 8,
    color: 'lightgray',    
    marginRight: 5,
    fontSize: '1.15rem',
    textAlign: 'right'
});

const KeyPaper = styled( Paper )({
    textAlign: 'center',
    width: 'max-content',
    padding: 3,
    paddingLeft: 12,
    paddingRight: 12,
    color: 'darkgray',
    marginLeft: 5,
    marginRight: 5,
});

const KeyCombinationContainer = styled( 'div' )({
    display: 'flex',
    flexDirection: 'row',
    alignItems:'center'
});

const KeyCombinationListContainer = styled( 'div' )({
    display: 'flex',
    flexDirection: 'row',
    alignItems:'center'
});


function HotkeyHint( props: { label: string, keyCombinations: string[][] } ) {

    const plusSign = (
        <Typography color='darkgray' >
            +
        </Typography>
    );

    const or = (
        <Typography color='darkgray' mr={1} ml={1}>
            or
        </Typography>
    );

    return (
        <Box display='flex' alignItems='center' justifyContent='center'
            m='auto' ml={1} mr={1} width='100%'
        >

            <KeyActionText width='100%'>
                {props.label}
            </KeyActionText>            

            <Box display='flex' width='100%' alignItems='center' flexDirection='row'>

                { props.keyCombinations?.map( ( keys, i ) => (
                    <KeyCombinationListContainer key={i}>
                        { keys?.map( ( key, j ) => ( 
                            <KeyCombinationContainer key={j} >
                                <KeyPaper variant="outlined" >
                                    {key}
                                </KeyPaper>
                                { j+1 < keys.length && plusSign }
                            </KeyCombinationContainer>
                        ) ) }
                        { i+1 < props.keyCombinations.length && or }
                    </KeyCombinationListContainer>
                ) ) }

            </Box>
            
        </Box>
    )
}


export default function HotkeyHints() {

    const { activeSettingsPreset } = useContext( SettingsContext );

    const overlayHotkeys = activeSettingsPreset?.overlay.hotkeys;

    const ppOcrSettings = activeSettingsPreset?.ocr_engines
        .find( engineSettings => {
            return engineSettings.ocr_adapter_name === 'PpOcrAdapter'
        });

    const cloudVisionSettings = activeSettingsPreset?.ocr_engines
        .find( engineSettings => {
            return engineSettings.ocr_adapter_name === 'CloudVisionOcrAdapter'
        });

    const googleLensSettings = activeSettingsPreset?.ocr_engines
        .find( engineSettings => {
            return engineSettings.ocr_adapter_name === 'GoogleLensOcrAdapter'
        });

    function createHotkeyHint( label: string, keyCombinationsStr: string[] ): JSX.Element {

        if ( !label || !keyCombinationsStr ) return;
        
        const keyCombinations = keyCombinationsStr.map( keysStr => (
            keysStr?.split('+').filter( key => key != 'undefined' )
        ));

        return  <HotkeyHint label={label} keyCombinations={keyCombinations} />
    }

    const ocrHotkeysStrings = [ overlayHotkeys?.ocr ];
    if (overlayHotkeys?.ocr_on_screen_shot)
        ocrHotkeysStrings.push( 'PrintScreen' );    

    return (
        <Box maxWidth='600px' m='auto'>

            <Box display='flex' 
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                m='auto' width='100%'
            >
                { createHotkeyHint( 'Primary OCR', ocrHotkeysStrings ) }
                { createHotkeyHint( 'PaddleOCR', [ppOcrSettings?.hotkey] ) }
                { createHotkeyHint( 'Google Lens', [googleLensSettings?.hotkey] ) }
                { createHotkeyHint( 'Cloud Vision', [cloudVisionSettings?.hotkey] ) }

                { createHotkeyHint( 'Toggle overlay', [overlayHotkeys?.toggle] ) }
                { createHotkeyHint( 'Show overlay', [overlayHotkeys?.show] ) }
                { createHotkeyHint( 'Hide overlay', [overlayHotkeys?.clear] ) }

                { createHotkeyHint( 'Copy text', [overlayHotkeys?.copy_text] ) }

                { createHotkeyHint( 'Edit Overlay', ['Ctrl+Double Click'] ) }
                { createHotkeyHint( 'Move/Resize Overlay', ['Ctrl+Shift+M'] ) }

                
            </Box>

        </Box>        
    );
}