import { Box, Container, Divider, Grid, TextField, Typography } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { useContext, useEffect } from "react";
import AppSettingsHotkeys from "./AppSettingsHotkeys";



export default function AppSettingsMenu() {

    const { activeSettingsPreset, updateActivePreset } = useContext( SettingsContext );    

    useEffect( () => {

    }, [activeSettingsPreset] );

    return (
        <Container maxWidth='sm'>
            
            <AppSettingsHotkeys/>

        </Container>
    )
}