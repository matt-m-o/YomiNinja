import { Box, Card, CardContent, Container, Divider, Grid, TextField, Typography, styled } from "@mui/material";
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

    return (
        <Card variant="elevation" sx={{ borderRadius: 4 }}>

            <CardContent>

                <Container maxWidth='md'>
                
                    <AppSettingsHotkeys/>
                    
                    <SectionDivider/>

                    <AppSettingsOthers/>

                    <SectionDivider/>

                    <AppSettingsVisuals/>

                    <SectionDivider/>

                    <AppSettingsOcrEngine/>

                </Container>

            </CardContent>

        </Card>
        
    )
}