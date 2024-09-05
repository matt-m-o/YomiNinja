import { Autocomplete, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { CaptureSource } from "../../../electron-src/ocr_recognition/common/types";
import { OcrTargetRegionJson } from "../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import { SetStateAction, useContext, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import OcrSettingsSlider from "../AppSettings/OcrSettings/OcrSettingsSlider";
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { TTSContext } from "../../context/text-to-speech.provider";

export type AutoOcrOptionsProps = {
    selectedTargetRegion: OcrTargetRegionJson;
    setSelectedTargetRegion: (value: SetStateAction<OcrTargetRegionJson>) => void
};

export default function TTSOptions( props: AutoOcrOptionsProps ) {

    const {
        selectedTargetRegion,
        setSelectedTargetRegion
    } = props;

    const {
        updateTargetRegion,
    } = useContext( OcrTemplatesContext );

    const { getVoices } = useContext( TTSContext );

    const targetRegionTTSVoiceName: string = getVoices().find(
        voice => {
            return selectedTargetRegion?.text_to_speech_options?.voice_uri == voice.voiceURI
        }
    )?.name || '';
    const ttsVoiceOptions: string[] = getVoices()?.map( voice => voice.name );

    return ( <>
        <Autocomplete autoHighlight
            fullWidth
            renderInput={ (params) => {
                return <TextField {...params}
                    label='Voice'
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: <RecordVoiceOverIcon sx={{ mr: '10px' }}/>,
                        style: { paddingLeft: '14px' }
                    }}
                />
            }}
            value={ targetRegionTTSVoiceName }
            onChange={( event: any, newValue: string | null ) => {

                const voice_uri = getVoices()
                    ?.find( item => item.name === newValue )
                    ?.voiceURI;

                // handleLanguageSelectChange( newValue );
                const updatedRegion = {
                    ...selectedTargetRegion,
                    text_to_speech_options: {
                        ...selectedTargetRegion.text_to_speech_options,
                        voice_uri
                    }
                }

                updateTargetRegion( updatedRegion );
                setSelectedTargetRegion( updatedRegion );
            }}
            options={ ttsVoiceOptions }
            sx={{ mb: '25px' }}
            ListboxProps={{
                style: {
                    backgroundColor: '#121212',
                }
            }}
        />

        <OcrSettingsSlider
            label="Volume"
            min={0}
            max={100}
            value={ Number( selectedTargetRegion?.text_to_speech_options?.volume ) * 100 }
            step={1}
            onChange={ ( event, newValue ) => {
                if (typeof newValue === 'number') {

                    newValue = newValue / 100;

                    setSelectedTargetRegion({
                        ...selectedTargetRegion,
                        text_to_speech_options: {
                            ...selectedTargetRegion.text_to_speech_options,
                            volume: newValue
                        }
                    })
                }
            }}
            onChangeCommitted={ () => {
                updateTargetRegion({
                    ...selectedTargetRegion,
                    text_to_speech_options: {
                        ...selectedTargetRegion.text_to_speech_options,
                    }
                });
            }}
        />

        <OcrSettingsSlider
            label="Speed"
            min={0.1}
            max={10}
            value={ Number( selectedTargetRegion?.text_to_speech_options?.speed )  }
            step={0.1}
            onChange={ ( event, newValue ) => {
                if (typeof newValue === 'number') {

                    setSelectedTargetRegion({
                        ...selectedTargetRegion,
                        text_to_speech_options: {
                            ...selectedTargetRegion.text_to_speech_options,
                            speed: newValue
                        }
                    })
                }
            }}
            onChangeCommitted={ () => {
                updateTargetRegion({
                    ...selectedTargetRegion,
                    text_to_speech_options: {
                        ...selectedTargetRegion.text_to_speech_options,
                    }
                });
            }}
        />

        <OcrSettingsSlider
            label="Pitch"
            min={0}
            max={2}
            value={ Number( selectedTargetRegion?.text_to_speech_options?.pitch ) }
            step={0.05}
            onChange={ ( event, newValue ) => {
                if (typeof newValue === 'number') {

                    setSelectedTargetRegion({
                        ...selectedTargetRegion,
                        text_to_speech_options: {
                            ...selectedTargetRegion.text_to_speech_options,
                            pitch: newValue
                        }
                    })
                }
            }}
            onChangeCommitted={ () => {
                updateTargetRegion({
                    ...selectedTargetRegion,
                    text_to_speech_options: {
                        ...selectedTargetRegion.text_to_speech_options,
                    }
                });
            }}
        />

        <FormControlLabel label='Autoplay'
            // title=''
            sx={{ ml: 0,  mt: 0, mb: 1, width: '100%' }}
            control={
                <Switch
                    checked={ Boolean( selectedTargetRegion?.text_to_speech_options?.automatic ) }
                    onChange={ ( event ) => {

                        const updatedRegion = {
                            ...selectedTargetRegion,
                            text_to_speech_options: {
                                ...selectedTargetRegion.text_to_speech_options,
                                automatic: event.target.checked
                            }
                        }

                        updateTargetRegion( updatedRegion );
                        setSelectedTargetRegion( updatedRegion );
                    }}
                /> 
            }
        />

        <FormControlLabel label='Play on click'
            // title=''
            sx={{ ml: 0,  mt: 0, mb: 1, width: '100%' }}
            control={
                <Switch
                    checked={ Boolean( selectedTargetRegion?.text_to_speech_options?.on_click ) }
                    onChange={ ( event ) => {

                        const updatedRegion = {
                            ...selectedTargetRegion,
                            text_to_speech_options: {
                                ...selectedTargetRegion.text_to_speech_options,
                                on_click: event.target.checked
                            }
                        }

                        updateTargetRegion( updatedRegion );
                        setSelectedTargetRegion( updatedRegion );
                    }}
                /> 
            }
        />

        <FormControlLabel label='Play on hover'
            // title=''
            sx={{ ml: 0,  mt: 0, mb: 1, width: '100%' }}
            control={
                <Switch
                    checked={ Boolean( selectedTargetRegion?.text_to_speech_options?.on_hover ) }
                    onChange={ ( event ) => {

                        const updatedRegion = {
                            ...selectedTargetRegion,
                            text_to_speech_options: {
                                ...selectedTargetRegion.text_to_speech_options,
                                on_hover: event.target.checked
                            }
                        }

                        updateTargetRegion( updatedRegion );
                        setSelectedTargetRegion( updatedRegion );
                    }}
                /> 
            }
        />
    </> );
}