import { Box, Button, Card, CardContent, Container, Typography } from "@mui/material";
import OcrTemplatesTable from "./OcrTemplatesTable";
import { useContext, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import CreateOcrTemplateModal from "./CreateOcrTemplateModal";



export default function OcrTemplates() {

    const { ocrTemplates } = useContext( OcrTemplatesContext );

    const [ openCreateOcrTemplateModal, setOpenCreateOcrTemplateModal ] = useState(false);

    return <>
        <Card variant="elevation" sx={{ borderRadius: 4, userSelect: 'none' }}>

            <CreateOcrTemplateModal
                open={openCreateOcrTemplateModal}
                handleClose={ () => setOpenCreateOcrTemplateModal(false) }
            />

            <CardContent>
                <Container maxWidth='md'>

                    <Box sx={{ flexGrow: 1, margin: 1, mb: 2 }}>

                        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }} m={2} ml={0} mr={0}>
                            <Typography gutterBottom variant="h6" component="div" margin={0} ml={0} mb={4}>
                                OCR Templates
                            </Typography>
                        </Box> */}

                        <Button 
                            onClick={ () => setOpenCreateOcrTemplateModal( true ) }
                        >
                            New Template
                        </Button>

                        <OcrTemplatesTable templates={ocrTemplates} />

                    </Box>

                </Container>
            </CardContent>
        </Card>
    </>
}