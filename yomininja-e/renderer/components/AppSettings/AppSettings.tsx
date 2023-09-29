import { Box, Container, Divider, Grid, TextField, Typography } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect } from "react";
import AppSettingsHotkeys from "./AppSettingsHotkeys";
import AppSettingsVisuals from "./AppSettingsVisuals";
import AppSettingsOthers from "./AppSettingsOthers";



export default function AppSettingsMenu() {

    const { activeSettingsPreset, updateActivePreset } = useContext( SettingsContext );    

    useEffect( () => {

    }, [activeSettingsPreset] );

    return (
        <Container maxWidth='md'>
            
            <AppSettingsHotkeys/>

            <Divider/>

            <AppSettingsVisuals/>

            <Divider/>

            <AppSettingsOthers/>

        </Container>
    )
}