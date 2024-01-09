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
    
    const ocrKeys = stringToHotkeyCombination( overlayHotkeys?.ocr );
    // const copyTextKeys: HotkeyCombination = stringToHotkeyCombination( overlayHotkeys?.copy_text );
    const toggleOverlayKeys = stringToHotkeyCombination( overlayHotkeys?.toggle );
    const showOverlayKeys = stringToHotkeyCombination( overlayHotkeys?.show );
    const clearOverlayKeys = stringToHotkeyCombination( overlayHotkeys?.clear );
    // const [ ocrOnPrintScreen, setOcrOnPrintScreen ] = useState< boolean >( Boolean(overlayHotkeys?.ocr_on_screen_shot) );
    const ocrOnPrintScreen = Boolean(overlayHotkeys?.ocr_on_screen_shot);

    function stringToHotkeyCombination( hotkeyString: string ): string {
        return hotkeyString?.split('+').join( ' + ' ) || '';
    }

    function hotkeyCombinationToString( keys: string[] ) {
        const combination = keys.join('+');
        console.log({ combination });
        return combination;
    }

    
    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>
            

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                Overlay Hotkeys
            </Typography>

            <HotkeyFields
                title='OCR'
                keyCombination={ ocrKeys }
                // setStateAction={ setOcrKeys }
                onChangeHandler={ ( input?: string[]  ) => {
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
                title='Toggle overlay'
                keyCombination={ toggleOverlayKeys }
                onChangeHandler={ ( input?: string[]  ) => {
                    if ( !input ) return;
                    updateActivePresetHotkeys({ toggle: hotkeyCombinationToString( input ) })
                }}
            />

            <HotkeyFields
                title='Show overlay'
                keyCombination={ showOverlayKeys }
                onChangeHandler={ ( input?: string[]  ) => {
                    if ( !input ) return;
                    updateActivePresetHotkeys({ show: hotkeyCombinationToString( input ) })
                }}
            />

            <HotkeyFields
                title='Hide overlay'
                keyCombination={ clearOverlayKeys }
                onChangeHandler={ ( input?: string[]  ) => {
                    if ( !input ) return;
                    updateActivePresetHotkeys({ clear: hotkeyCombinationToString( input ) })
                }}
            />
            
        </Box>
    )
}