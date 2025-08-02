import { Box, Container, Divider, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import HotkeyFields, { HotkeyCombination } from "./HotkeyFields";
import { OcrEngineSettings, SettingsPresetJson } from "../../../electron-src/@core/domain/settings_preset/settings_preset";
import { AppInfoContext } from "../../context/app_info.provider";


// Settings section component
export default function AppSettingsHotkeys() {

    const {
        activeSettingsPreset,
        defaultSettingsPreset,
        updateActivePresetHotkeys,
        updateActivePresetOcrEngine
    } = useContext( SettingsContext );

    const {
        systemInfo
    } = useContext( AppInfoContext );

    const appleVisionSettings = getOcrEngineSettings('AppleVisionAdapter');
    const appleVisionDefaultSettings = getOcrEngineSettings('AppleVisionAdapter', true);

    const ppOcrSettings = getOcrEngineSettings('PpOcrAdapter');
    const ppOcrDefaultSettings = getOcrEngineSettings('PpOcrAdapter', true);

    const mangaOcrSettings = getOcrEngineSettings('MangaOcrAdapter');
    const mangaOcrDefaultSettings = getOcrEngineSettings('MangaOcrAdapter', true);

    const cloudVisionSettings = getOcrEngineSettings('CloudVisionOcrAdapter');
    const cloudVisionDefaultSettings = getOcrEngineSettings('CloudVisionOcrAdapter', true);

    const googleLensSettings = getOcrEngineSettings('GoogleLensOcrAdapter');
    const googleLensDefaultSettings = getOcrEngineSettings('GoogleLensOcrAdapter', true);
    
    // const [ copyTextKeys, setCopyTextKeys ] = useState< HotkeyCombination >();
    
    
    const overlayHotkeys = activeSettingsPreset?.overlay.hotkeys;
    const overlayDefaultHotkeys = defaultSettingsPreset?.overlay.hotkeys;
    
    const ocrKeys = stringToHotkeyCombination( overlayHotkeys?.ocr );
    const copyTextKeys = stringToHotkeyCombination( overlayHotkeys?.copy_text );
    const toggleOverlayKeys = stringToHotkeyCombination( overlayHotkeys?.toggle );
    const showOverlayKeys = stringToHotkeyCombination( overlayHotkeys?.show );
    const clearOverlayKeys = stringToHotkeyCombination( overlayHotkeys?.clear );
    const manualAdjustmentOverlayKeys = stringToHotkeyCombination( overlayHotkeys?.manual_adjustment );
    // const [ ocrOnPrintScreen, setOcrOnPrintScreen ] = useState< boolean >( Boolean(overlayHotkeys?.ocr_on_screen_shot) );
    const ocrOnPrintScreen = Boolean(overlayHotkeys?.ocr_on_screen_shot);

    const appleVisionKeys = stringToHotkeyCombination( appleVisionSettings?.hotkey );
    const paddleOcrKeys = stringToHotkeyCombination( ppOcrSettings?.hotkey );
    const mangaOcrKeys = stringToHotkeyCombination( mangaOcrSettings?.hotkey );
    const cloudVisionKeys = stringToHotkeyCombination( cloudVisionSettings?.hotkey );
    const googleLensKeys = stringToHotkeyCombination( googleLensSettings?.hotkey );

    function stringToHotkeyCombination( hotkeyString: string ): string {
        return hotkeyString?.split('+').join( ' + ' ) || '';
    }

    function hotkeyCombinationToString( keys: string[] ) {
        const combination = keys.join('+');
        console.log({ combination });
        return combination;
    }

    function getOcrEngineSettings( ocrAdapterName: string, getDefault = false ) {
        const preset = getDefault ? defaultSettingsPreset : activeSettingsPreset;

        if ( !preset?.ocr_engines ) return;

        return preset.ocr_engines
            .find( engineSettings => {
                return engineSettings.ocr_adapter_name === ocrAdapterName
            });
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

    const cmdLineBaseUrl = location.host+'/remote-control';
    let baseCmdLine = systemInfo.httpCliTool;

    if ( systemInfo.httpCliTool === 'wget' )
        baseCmdLine += ' -qO- '+cmdLineBaseUrl;

    else if ( systemInfo.httpCliTool === 'curl' )
        baseCmdLine += ' -o- '+cmdLineBaseUrl;

    const getCmdLine = ( path: string ) => {
        return `${baseCmdLine}${path}?key=${overlayHotkeys?.remote_control_key}`
    }
    
    return (
        <Box sx={{ margin: 1, mt: 0 }}>

            <Typography gutterBottom variant="h6" component="div" ml={0} mb={3}>
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
                    defaultKeys={overlayDefaultHotkeys?.ocr}
                    // setStateAction={ setOcrKeys }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ ocr: hotkeyCombinationToString( input ) })
                    }}
                    commandLine={ getCmdLine('/ocr') }
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
                
                { appleVisionSettings &&
                    <HotkeyFields
                        label='Apple Vision'
                        keyCombination={ appleVisionKeys }
                        defaultKeys={appleVisionDefaultSettings?.hotkey}
                        onChangeHandler={ ( input?: string[]  ) => {
                            if ( !input ) return;
                            updateActivePresetOcrEngine({
                                ...appleVisionSettings,
                                hotkey: hotkeyCombinationToString( input )
                            });
                        }}
                        commandLine={ getCmdLine('/ocr/apple-vision') }
                    />
                }

                { ppOcrSettings &&
                    <HotkeyFields
                        label='PaddleOCR'
                        keyCombination={ paddleOcrKeys }
                        defaultKeys={ppOcrDefaultSettings?.hotkey}
                        // setStateAction={ setOcrKeys }
                        onChangeHandler={ ( input?: string[]  ) => {
                            if ( !input ) return;
                            updateActivePresetOcrEngine({
                                ...ppOcrSettings,
                                hotkey: hotkeyCombinationToString( input )
                            });
                        }}
                        commandLine={ getCmdLine('/ocr/paddleocr') }
                    />
                }

                <HotkeyFields
                    label='MangaOCR'
                    keyCombination={ mangaOcrKeys }
                    defaultKeys={mangaOcrDefaultSettings?.hotkey}
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetOcrEngine({
                            ...mangaOcrSettings,
                            hotkey: hotkeyCombinationToString( input )
                        });
                    }}
                    commandLine={ getCmdLine('/ocr/mangaocr') }
                />

                <HotkeyFields
                    label='Google Lens'
                    keyCombination={ googleLensKeys }
                    defaultKeys={googleLensDefaultSettings?.hotkey}
                    // setStateAction={ setOcrKeys }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetOcrEngine({
                            ...googleLensSettings,
                            hotkey: hotkeyCombinationToString( input )
                        });
                    }}
                    commandLine={ getCmdLine('/ocr/google-lens') }
                />

                <HotkeyFields
                    label='Cloud Vision'
                    keyCombination={ cloudVisionKeys }
                    defaultKeys={cloudVisionDefaultSettings?.hotkey}
                    // setStateAction={ setOcrKeys }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetOcrEngine({
                            ...cloudVisionSettings,
                            hotkey: hotkeyCombinationToString( input )
                        });
                    }}
                    commandLine={ getCmdLine('/ocr/cloud-vision') }
                />

                <HotkeyFields
                    label='Toggle overlay'
                    keyCombination={ toggleOverlayKeys }
                    defaultKeys={overlayDefaultHotkeys?.toggle}
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ toggle: hotkeyCombinationToString( input ) })
                    }}
                    commandLine={ getCmdLine('/toggle-overlay') }
                />

                <HotkeyFields
                    label='Show overlay'
                    keyCombination={ showOverlayKeys }
                    defaultKeys={overlayDefaultHotkeys?.show}
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ show: hotkeyCombinationToString( input ) })
                    }}
                    commandLine={ getCmdLine('/show-overlay') }
                />

                <HotkeyFields
                    label='Hide overlay'
                    keyCombination={ clearOverlayKeys }
                    defaultKeys={ overlayDefaultHotkeys?.clear }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ clear: hotkeyCombinationToString( input ) })
                    }}
                    commandLine={ getCmdLine('/hide-overlay') }
                />

                <HotkeyFields
                    label='Manually adjust overlay'
                    keyCombination={ manualAdjustmentOverlayKeys }
                    defaultKeys={overlayDefaultHotkeys?.manual_adjustment}
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ manual_adjustment: hotkeyCombinationToString( input ) })
                    }}
                    commandLine={ getCmdLine('/toggle-movable-overlay') }
                />

                <HotkeyFields
                    label='Copy text'
                    keyCombination={ copyTextKeys }
                    defaultKeys={ overlayDefaultHotkeys?.copy_text }
                    onChangeHandler={ ( input?: string[]  ) => {
                        if ( !input ) return;
                        updateActivePresetHotkeys({ copy_text: hotkeyCombinationToString( input ) })
                    }}
                    commandLine={ getCmdLine('/copy-text') }
                />

            </div>
        </Box>
    )
}