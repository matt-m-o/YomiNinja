import { Box, Typography } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import HotkeyFields, { HotkeyCombination } from "./HotkeyFields";


// Settings section component
export default function AppSettingsHotkeys() {

    const { activeSettingsPreset, updateActivePreset } = useContext( SettingsContext );

    const [ ocrKeys, setOcrKeys ] = useState< HotkeyCombination >();


    function stringToHotkeyCombination( hotkeyString: string ): HotkeyCombination {

        const keys = hotkeyString.split('+');

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

        const { overlay } = activeSettingsPreset;

        if ( overlay?.hotkeys ) 
            setOcrKeys( stringToHotkeyCombination(overlay?.hotkeys.ocr) );

    }, [activeSettingsPreset] );

    useEffect( () => {
        
        if ( !ocrKeys )
            return;

        const newOcrHotkeyStr = hotkeyCombinationToString(ocrKeys);

        if ( activeSettingsPreset.overlay.hotkeys.ocr == newOcrHotkeyStr )
            return;

        activeSettingsPreset.overlay.hotkeys.ocr = newOcrHotkeyStr;
        updateActivePreset(activeSettingsPreset);

    }, [ocrKeys] );

    
    return (
        <Box sx={{ flexGrow: 1, margin: 1, }}>
                        
            <Typography gutterBottom variant="h5" component="div" margin={2} ml={0}>
                Hotkeys
            </Typography>

            <HotkeyFields
                hotkeyCombinationState={ocrKeys}
                setStateAction={setOcrKeys}                
            />
            
        </Box>
    )
}