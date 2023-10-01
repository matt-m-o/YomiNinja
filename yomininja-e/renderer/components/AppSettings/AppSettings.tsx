import { Box, Container, Divider, Grid, TextField, Typography, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect } from "react";
import AppSettingsHotkeys from "./AppSettingsHotkeys";
import AppSettingsVisuals from "./AppSettingsVisuals";
import AppSettingsOthers from "./AppSettingsOthers";
import AppSettingsOcrEngine from "./AppSettingsOcrEngine";


const SectionDivider = styled( Divider )({
    marginTop: '30px',
    marginBottom: '30px',
});

export default function AppSettingsMenu() {

    const { activeSettingsPreset, updateActivePreset } = useContext( SettingsContext );    

    useEffect( () => {

    }, [activeSettingsPreset] );

    return (
        <Container maxWidth='md'>
            
            <AppSettingsHotkeys/>
            
            <SectionDivider/>

            <AppSettingsOthers/>

            <SectionDivider/>

            <AppSettingsVisuals/>

            <SectionDivider/>

            <AppSettingsOcrEngine/>

        </Container>
    )
}