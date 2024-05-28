import { Alert, Backdrop, Box, CircularProgress, Container, Divider, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { OcrEngineSettingsU } from "../../../../electron-src/@core/infra/types/entity_instance.types";
import OcrSettingsSlider from "./OcrSettingsSlider";


export const SettingsOptionContainer = styled( Container )({
    marginTop: 25,
    marginBottom: 25,
    '&:hover': {
        '& .reset-parameter-btn': {
            visibility: 'visible !important'
        }
    }
});

type CommonOcrSettingsProps = {
    ocrEngineSettings: OcrEngineSettingsU;
}

// Settings section component
export default function CommonOcrSettings( props: CommonOcrSettingsProps ) {

    const { ocrEngineSettings } = props;

    const { updateActivePresetOcrEngine } = useContext( SettingsContext );    
    
    const [ imageScalingFactor, setImageScalingFactor ] = useState( ocrEngineSettings?.image_scaling_factor || 1 );
    const [ invertColors, setInvertColors ] = useState( ocrEngineSettings?.invert_colors || false );

    useEffect( () => {

        if ( !ocrEngineSettings ) return;

        setImageScalingFactor( ocrEngineSettings?.image_scaling_factor );

    }, [ ocrEngineSettings ] )


    function resetImageScalingFactor() {
        updateActivePresetOcrEngine({
            ...ocrEngineSettings,
            image_scaling_factor: 1
        });
        setImageScalingFactor( 1 );
    }

    return ( <>
        
        <SettingsOptionContainer sx={{ mt: 1, mb: 2 }}>

            <FormControlLabel label='Invert image colors'
                control={
                    <Switch
                        checked={ Boolean( invertColors ) }
                        onChange={ ( event ) => {
                            setInvertColors( event.target.checked );
                            updateActivePresetOcrEngine({
                                ...ocrEngineSettings,
                                invert_colors: event.target.checked
                            });
                        }}
                    /> 
                }
            />

        </SettingsOptionContainer>

        <SettingsOptionContainer sx={{ mt: 0 }}>
            <OcrSettingsSlider
                label="Image scaling factor"
                leftLabel="Speed"
                rightLabel="Accuracy"
                marks
                min={0.1}
                max={2}
                step={0.05}
                value={ imageScalingFactor }
                onChange={ ( event, newValue ) => {
                    if (typeof newValue === 'number') {
                        setImageScalingFactor( newValue );
                    }
                }}
                onChangeCommitted={ () => {
                    // console.log({ imageScalingFactor });
                    updateActivePresetOcrEngine({
                        ...ocrEngineSettings,
                        image_scaling_factor: imageScalingFactor
                    });
                }}
                reset={ resetImageScalingFactor }
            />
        
        </SettingsOptionContainer>

    </> )
}