import { Box, Button, Card, CardContent, Container, Typography } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DictionaryImportModal from "./DictionaryImportModal";
import { useState } from "react";


export default function Dictionary() {

    const [ openDictImportModal, setOpenDictImportModal ] = useState(false);

    return (
        <Card variant="elevation" sx={{ borderRadius: 4 }}>


            <CardContent>            
                <Container maxWidth='md'>

                    <Box sx={{ flexGrow: 1, margin: 1 }}>

                        <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                            Dictionaries
                        </Typography>


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