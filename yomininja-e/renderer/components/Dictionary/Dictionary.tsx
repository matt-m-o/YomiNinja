import { Box, Button, Card, CardContent, Container, Divider, FormControlLabel, Grid, Switch, Typography, styled } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DictionaryImportModal from "./DictionaryImportModal";
import { useContext, useState } from "react";
import DictionariesTable from "./DictionariesTable";
import { DictionaryContext } from "../../context/dictionary.provider";
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import { SettingsContext } from "../../context/settings.provider";


export default function Dictionary() {

    const [ openDictImportModal, setOpenDictImportModal ] = useState(false);
    const {
        installedDictionaries,
        deleteAllDictionaries,
    } = useContext( DictionaryContext );

    const { activeSettingsPreset, updateActivePresetDictionary } = useContext( SettingsContext );
    const { dictionary } = activeSettingsPreset;

    return (
        <Card variant="elevation" sx={{ borderRadius: 4, userSelect: 'none' }}>
            <DictionaryImportModal
                open={openDictImportModal}
                handleClose={ () => setOpenDictImportModal(false) }
            />

            <CardContent>
                <Container maxWidth='xl'>

                    <Box sx={{ flexGrow: 1, margin: 1 }}>

                        <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                            YomiNinja Dictionary (Experimental)
                        </Typography>

                        <Typography gutterBottom component="div" margin={2} ml={0} mb={1}>
                            This is an experimental popup dictionary made for YomiNinja.
                        </Typography>
                        <Typography gutterBottom component="div" margin={2} ml={0} mb={3}>
                            This feature is currently in an experimental stage of development. 
                            Please be aware that it may have bugs, limited functionality, or unexpected behavior. 
                            Is strongly recommend using it only for testing and providing feedback. <br/> 
                            Your feedback will help us improve this feature, so thank you for your support and understanding!
                        </Typography>

                        <FormControlLabel label='Enable Yomi Ninja dictionary'
                            sx={{
                                ml: 2
                            }}
                            control={
                                <Switch
                                    checked={ Boolean( dictionary?.enabled ) }
                                    onChange={ ( event ) => {
                                        updateActivePresetDictionary({
                                            enabled: event.target.checked
                                        });
                                    }}
                                /> 
                            }
                        />

                        <DictionariesTable dictionaries={installedDictionaries} />

                        <Grid container justifyContent="center" 
                            spacing={{ xs: 2, md: 2 }}
                            columns={{ xs: 1, sm: 4, md: 12 }}
                            sx={{ flexGrow: 1 }}
                        >
                    
                            <Grid item>
                                <Button variant="contained"
                                    startIcon={<AddRoundedIcon/>}
                                    onClick={ () => setOpenDictImportModal(true) }                                
                                >
                                    Import
                                </Button>
                            </Grid>

                            <Grid item>
                                <Button variant="contained"
                                    color='error'
                                    startIcon={<DeleteForeverRoundedIcon/>}
                                    onClick={ () => deleteAllDictionaries() }
                                >
                                    Delete all
                                </Button>
                            </Grid>
                            
                        </Grid>
                        
                    </Box>


                </Container>
            </CardContent>
            
        </Card>
    )
}