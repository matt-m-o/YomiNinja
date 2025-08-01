import { Box, Card, CardContent, Container, Divider, Grid, TextField, Typography, styled } from "@mui/material";
import { SettingsContext } from "../../context/settings.provider";
import { ReactNode, useContext, useEffect } from "react";
import AppSettingsHotkeys from "./AppSettingsHotkeys";
import AppSettingsVisuals from "./AppSettingsVisuals";
import AppSettingsOthers from "./AppSettingsOthers";
import AppSettingsOcrEngine from "./AppSettingsOcrEngine";
import AppSettingsGeneral from "./AppSettingsGeneral";


export default function AppSettingsMenu() {

    function SettingsSection( props:{ children: ReactNode } ) {
        return (
            <Card variant="elevation"
                sx={{
                    borderRadius: 4,
                    mb: 2
                }}
            >
                <CardContent>
                    { props.children }
                </CardContent>
            </Card>
        )
    }

    return (
        <Container maxWidth='lg'>

            <SettingsSection>

                <AppSettingsGeneral/>
                
            </SettingsSection>

            <SettingsSection>

                <AppSettingsHotkeys/>

            </SettingsSection>

            <SettingsSection>

                <AppSettingsOthers/>

            </SettingsSection>

            <SettingsSection>

                <AppSettingsVisuals/>

            </SettingsSection>

            <SettingsSection>

                <AppSettingsOcrEngine/>

            </SettingsSection>

        </Container>
    )
}