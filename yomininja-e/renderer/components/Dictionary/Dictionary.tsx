import { Box, Button, Card, CardContent, Container, Grid, Typography } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DictionaryImportModal from "./DictionaryImportModal";
import { useContext, useState } from "react";
import DictionariesTable from "./DictionariesTable";
import { DictionaryContext } from "../../context/dictionary.provider";
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';


export default function Dictionary() {

    const [ openDictImportModal, setOpenDictImportModal ] = useState(false);
    const { installedDictionaries, deleteAllDictionaries } = useContext( DictionaryContext );

    return (
        <Card variant="elevation" sx={{ borderRadius: 4 }}>
            <DictionaryImportModal
                open={openDictImportModal}
                handleClose={ () => setOpenDictImportModal(false) }
            />

            <CardContent>            
                <Container maxWidth='md'>

                    <Box sx={{ flexGrow: 1, margin: 1 }}>

                        <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                            Imported Dictionaries
                        </Typography>

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