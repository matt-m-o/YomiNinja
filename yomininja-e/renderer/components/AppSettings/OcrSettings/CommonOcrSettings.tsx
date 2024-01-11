import { Alert, Backdrop, Box, CircularProgress, Container, Divider, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Popover, Select, Slider, Snackbar, Stack, Switch, SxProps, TextField, Theme, Typography, debounce, styled } from "@mui/material";
import { SettingsContext } from "../../../context/settings.provider";
import { useContext, useEffect, useState } from "react";
import { OcrEngineSettingsU } from "../../../../electron-src/@core/infra/types/entity_instance.types";


export const SettingsOptionContainer = styled( Container )({
    marginTop: 25,
    marginBottom: 25
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


    return ( <>
        
        <SettingsOptionContainer>

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

            <Typography gutterBottom component="div" margin={2} mb={1} ml={0} fontSize={'1.1rem'}>
                Image scaling factor
            </Typography>

            <Stack spacing={2} direction="row" sx={{ mb: 1, pl: 2, pr: 0 }} alignItems="center">

                <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                    Speed
                </Typography>

                <Slider
                    marks
                    min={0.1}
                    max={2}
                    step={0.05}
                    valueLabelDisplay="auto"
                    value={ imageScalingFactor }
                    style={{ marginRight: 8 }}
                    onChange={ ( event, newValue ) => {
                        if (typeof newValue === 'number') {
                            setImageScalingFactor( newValue );
                        }
                    }}
                    onChangeCommitted={ () => {
                        console.log({ imageScalingFactor });
                        updateActivePresetOcrEngine({
                            ...ocrEngineSettings,
                            image_scaling_factor: imageScalingFactor
                        });
                    }}
                />

                <Typography gutterBottom component="div" margin={2} fontSize={'0.95rem'}>
                    Accuracy
                </Typography>

            </Stack>
        
        </SettingsOptionContainer>

    </> )
}