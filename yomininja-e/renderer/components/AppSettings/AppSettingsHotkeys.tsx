import { Box, Divider, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import HotkeyFields, { HotkeyCombination } from "./HotkeyFields";


// Settings section component
export default function AppSettingsHotkeys() {

    const { activeSettingsPreset, updateActivePresetHotkeys } = useContext( SettingsContext );

    const [ ocrKeys, setOcrKeys ] = useState< HotkeyCombination >();
    const [ copyTextKeys, setCopyTextKeys ] = useState< HotkeyCombination >();
    const [ showOverlayKeys, setShowOverlayKeys ] = useState< HotkeyCombination >();
    const [ clearOverlayKeys, setClearOverlayKeys ] = useState< HotkeyCombination >();
    const [ ocrOnPrintScreen, setOcrOnPrintScreen ] = useState< boolean >( false );


    function stringToHotkeyCombination( hotkeyString: string ): HotkeyCombination {

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

    useEffect( () => {

        if ( !activeSettingsPreset )
            return;

        const { hotkeys } = activeSettingsPreset?.overlay;

        if ( hotkeys ) {

            setOcrKeys( stringToHotkeyCombination(hotkeys.ocr) );
            setCopyTextKeys( stringToHotkeyCombination(hotkeys.copy_text) );
            setShowOverlayKeys( stringToHotkeyCombination(hotkeys.show) );
            setClearOverlayKeys( stringToHotkeyCombination(hotkeys.show_and_clear) );
            setOcrOnPrintScreen( hotkeys.ocr_on_screen_shot );
        }

    }, [ activeSettingsPreset ] );


    useEffect( () => {
        
        if ( 
            !ocrKeys ||
            !showOverlayKeys ||
            !clearOverlayKeys ||
            !copyTextKeys
        )
            return;

        const newOcrHotkeyStr = hotkeyCombinationToString( ocrKeys );
        const newCopyTextHotkeyStr = hotkeyCombinationToString( copyTextKeys );
        const newShowOverlayHotkeyStr = hotkeyCombinationToString( showOverlayKeys );
        const newClearOverlayHotkeyStr = hotkeyCombinationToString( clearOverlayKeys );

        const { hotkeys } = activeSettingsPreset.overlay;

        if ( 
            hotkeys.ocr != newOcrHotkeyStr ||
            hotkeys.copy_text != newCopyTextHotkeyStr ||
            hotkeys.show != newShowOverlayHotkeyStr ||
            hotkeys.show_and_clear != newClearOverlayHotkeyStr ||
            hotkeys.ocr_on_screen_shot != ocrOnPrintScreen
        ) {
            updateActivePresetHotkeys({
                ocr: newOcrHotkeyStr,
                copy_text: newCopyTextHotkeyStr,
                show: newShowOverlayHotkeyStr,
                show_and_clear: newClearOverlayHotkeyStr,
                ocr_on_screen_shot: ocrOnPrintScreen
            });
        }

    }, [
        ocrKeys,
        showOverlayKeys,
        copyTextKeys,
        clearOverlayKeys,
        ocrOnPrintScreen
    ]);

    
    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>
            

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                Overlay Hotkeys
            </Typography>            

            <HotkeyFields
                title='OCR'
                hotkeyCombinationState={ ocrKeys }
                setStateAction={ setOcrKeys }
                sx={{ mb: 0 }}
            />

            <FormGroup>
                <FormControlLabel label='OCR on PrintScreen key press (fastest)' sx={{ ml: '40px' }}
                    control={
                        <Switch
                            checked={ocrOnPrintScreen}
                            onChange={ ( event ) => setOcrOnPrintScreen( event.target.checked ) }
                        /> 
                    }
                />                                    
            </FormGroup>

            <HotkeyFields
                title='Copy text'
                hotkeyCombinationState={ copyTextKeys }
                setStateAction={ setCopyTextKeys }
            />

            <HotkeyFields
                title='Show overlay'
                hotkeyCombinationState={ showOverlayKeys }
                setStateAction={ setShowOverlayKeys }
            />

            <HotkeyFields
                title='Clear overlay'
                hotkeyCombinationState={ clearOverlayKeys }
                setStateAction={ setClearOverlayKeys }
            />
            
        </Box>
    )
}