import { Box, Divider, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import HotkeyFields, { HotkeyCombination } from "./HotkeyFields";


// Settings section component
export default function AppSettingsHotkeys() {

    const { activeSettingsPreset, updateActivePresetHotkeys } = useContext( SettingsContext );

    // const [ ocrKeys, setOcrKeys ] = useState< HotkeyCombination >();
    // const [ copyTextKeys, setCopyTextKeys ] = useState< HotkeyCombination >();
    // const [ showOverlayKeys, setShowOverlayKeys ] = useState< HotkeyCombination >();
    // const [ clearOverlayKeys, setClearOverlayKeys ] = useState< HotkeyCombination >();
    
    const overlayHotkeys = activeSettingsPreset?.overlay.hotkeys;
    
    const ocrKeys: HotkeyCombination = stringToHotkeyCombination( overlayHotkeys?.ocr );
    // const copyTextKeys: HotkeyCombination = stringToHotkeyCombination( overlayHotkeys?.copy_text );
    const showOverlayKeys: HotkeyCombination = stringToHotkeyCombination( overlayHotkeys?.show );
    const clearOverlayKeys: HotkeyCombination = stringToHotkeyCombination( overlayHotkeys?.clear );
    // const [ ocrOnPrintScreen, setOcrOnPrintScreen ] = useState< boolean >( Boolean(overlayHotkeys?.ocr_on_screen_shot) );
    const ocrOnPrintScreen = Boolean(overlayHotkeys?.ocr_on_screen_shot);

    function stringToHotkeyCombination( hotkeyString: string ): HotkeyCombination {

        if ( !hotkeyString ) return;

        const keys = hotkeyString.split('+');
        if ( hotkeyString.slice( hotkeyString.length - 1 ) === '+' )
            keys[1] = '+';        

        // If the string contains only one key code
        if ( keys.length == 1 )
            return { key: keys[0] };

        return {
            modifierKey: keys[0],
            key: keys[1],
        };
    }

    function hotkeyCombinationToString( hotkeyCombination: HotkeyCombination ) {
        return hotkeyCombination.modifierKey + '+' + hotkeyCombination.key;
    }

    
    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>
            

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                Overlay Hotkeys
            </Typography>

            <HotkeyFields
                title='OCR'
                hotkeyCombinationState={ ocrKeys }
                // setStateAction={ setOcrKeys }
                onChangeHandler={ ( input: HotkeyCombination ) => {
                    if ( !input ) return;
                    updateActivePresetHotkeys({ ocr: hotkeyCombinationToString( input ) })
                }}
                sx={{ mb: 0 }}
            />

            <FormGroup>
                <FormControlLabel label='Auto OCR on PrintScreen key press (fastest)' sx={{ ml: '40px' }}
                    control={
                        <Switch
                            checked={ocrOnPrintScreen}
                            onChange={ ( event ) => {
                                updateActivePresetHotkeys({
                                    ocr_on_screen_shot: event.target.checked
                                });
                            }}
                        /> 
                    }
                />
            </FormGroup>

            <HotkeyFields
                title='Show overlay'
                hotkeyCombinationState={ showOverlayKeys }
                onChangeHandler={ ( input: HotkeyCombination ) => {
                    if ( !input ) return;
                    updateActivePresetHotkeys({ show: hotkeyCombinationToString( input ) })
                }}
            />

            <HotkeyFields
                title='Hide overlay boxes'
                hotkeyCombinationState={ clearOverlayKeys }
                onChangeHandler={ ( input: HotkeyCombination ) => {
                    if ( !input ) return;
                    updateActivePresetHotkeys({ clear: hotkeyCombinationToString( input ) })
                }}
            />
            
        </Box>
    )
}