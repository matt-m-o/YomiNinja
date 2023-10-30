import { Box, Button, Card, CardContent, Container, Typography } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DictionaryImportModal from "./DictionaryImportModal";
import { useContext, useState } from "react";
import DictionariesTable from "./DictionariesTable";
import { DictionaryContext } from "../../context/dictionary.provider";


export default function Dictionary() {

    const [ openDictImportModal, setOpenDictImportModal ] = useState(false);
    const { installedDictionaries } = useContext( DictionaryContext );

    return (
        <Card variant="elevation" sx={{ borderRadius: 4 }}>


            <CardContent>            
                <Container maxWidth='md'>

                    <Box sx={{ flexGrow: 1, margin: 1 }}>

                        <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                            Imported Dictionaries
                        </Typography>

                        <DictionariesTable dictionaries={installedDictionaries} />

                        <Box display='flex' justifyContent='center'>

                            <Button variant="contained"
                                startIcon={<AddRoundedIcon/>}
                                onClick={ () => setOpenDictImportModal(true) }                                
                            >
                                Import
                            </Button>
                            <DictionaryImportModal
                                open={openDictImportModal}
                                handleClose={ () => setOpenDictImportModal(false) }
                            />

                        </Box>
                        
                    </Box>

                </Container>
            </CardContent>
            
        </Card>
    )
}