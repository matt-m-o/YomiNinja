import { Box, Container, Divider, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import HotkeyFields, { HotkeyCombination } from "./HotkeyFields";
import { OcrEngineSettings } from "../../../electron-src/@core/domain/settings_preset/settings_preset";


// Settings section component
export default function AppSettingsHotkeys() {

    const {
        activeSettingsPreset,
        updateActivePresetHotkeys,
        updateActivePresetOcrEngine
    } = useContext( SettingsContext );

    const ppOcrSettings = activeSettingsPreset?.ocr_engines
        .find( engineSettings => {
            return engineSettings.ocr_adapter_name === 'PpOcrAdapter'
        });
    const cloudVisionSettings = activeSettingsPreset?.ocr_engines
        .find( engineSettings => {
            return engineSettings.ocr_adapter_name === 'CloudVisionOcrAdapter'
        });
    
    // const [ copyTextKeys, setCopyTextKeys ] = useState< HotkeyCombination >();
    
    
    const overlayHotkeys = activeSettingsPreset?.overlay.hotkeys;
    
    const ocrKeys = stringToHotkeyCombination( overlayHotkeys?.ocr );
    const copyTextKeys = stringToHotkeyCombination( overlayHotkeys?.copy_text );
    const toggleOverlayKeys = stringToHotkeyCombination( overlayHotkeys?.toggle );
    const showOverlayKeys = stringToHotkeyCombination( overlayHotkeys?.show );
    const clearOverlayKeys = stringToHotkeyCombination( overlayHotkeys?.clear );
    // const [ ocrOnPrintScreen, setOcrOnPrintScreen ] = useState< boolean >( Boolean(overlayHotkeys?.ocr_on_screen_shot) );
    const ocrOnPrintScreen = Boolean(overlayHotkeys?.ocr_on_screen_shot);

    const paddleOcrKeys = stringToHotkeyCombination( ppOcrSettings?.hotkey );
    const cloudVisionKeys = stringToHotkeyCombination( cloudVisionSettings?.hotkey );

    function stringToHotkeyCombination( hotkeyString: string ): string {
        return hotkeyString?.split('+').join( ' + ' ) || '';
    }

    function hotkeyCombinationToString( keys: string[] ) {
        const combination = keys.join('+');
        console.log({ combination });
        return combination;
    }

    const ocrOnPrintScreenSwitch = (
        <dl
            style={{
                display: 'table-row'
            }}
        >
            <dt style={{ display: 'table-cell' }}>
            </dt>
            <dd>
                <FormGroup >
                    <FormControlLabel label='Trigger OCR on PrintScreen key press (fastest)'
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
                        sx={{ ml: -3, mb: 2 }}
                    />
                </FormGroup>
            </dd>
        </dl>
        
    );

    
    return (
        <Box sx={{ margin: 1 }}>
            

            <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                Overlay Hotkeys
            </Typography>

            

            <div
                style={{
                    width: '100%',
                    display:'inline-table',
                    borderCollapse: 'separate',
                    margin: 'auto',
                    paddingLeft: '20px',
                    paddingRight: '15px'
                }}
            >

                <HotkeyFields
                    label='Primary OCR'
                    title='Triggers the currently selected OCR engine'
                    keyCombination={ ocrKeys }
                    // setStateAction={ setOcrKeys }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ ocr: hotkeyCombinationToString( input ) })
                    }}
                    sx={{ marginBottom: 0 }}
                    children={
                        <FormGroup >
                            <FormControlLabel label='Trigger OCR on PrintScreen key press (fastest)' sx={{ ml: '40px' }}
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
                    }
                />
                {ocrOnPrintScreenSwitch}

                <HotkeyFields
                    label='PaddleOCR'
                    keyCombination={ paddleOcrKeys }
                    // setStateAction={ setOcrKeys }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetOcrEngine({
                            ...ppOcrSettings,
                            hotkey: hotkeyCombinationToString( input )
                        });
                    }}
                    // sx={{ mb: 0 }}
                />

                <HotkeyFields
                    label='Cloud Vision'
                    keyCombination={ cloudVisionKeys }
                    // setStateAction={ setOcrKeys }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetOcrEngine({
                            ...cloudVisionSettings,
                            hotkey: hotkeyCombinationToString( input )
                        });
                    }}
                    // sx={{ mb: 0 }}
                />

                <HotkeyFields
                    label='Toggle overlay'
                    keyCombination={ toggleOverlayKeys }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ toggle: hotkeyCombinationToString( input ) })
                    }}
                />

                <HotkeyFields
                    label='Show overlay'
                    keyCombination={ showOverlayKeys }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ show: hotkeyCombinationToString( input ) })
                    }}
                />

                <HotkeyFields
                    label='Hide overlay'
                    keyCombination={ clearOverlayKeys }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ clear: hotkeyCombinationToString( input ) })
                    }}
                />

                <HotkeyFields
                    label='Copy text'
                    keyCombination={ copyTextKeys }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ copy_text: hotkeyCombinationToString( input ) })
                    }}
                />

            </div>
        </Box>
    )
}