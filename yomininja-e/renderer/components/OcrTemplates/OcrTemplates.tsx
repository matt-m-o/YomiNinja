import { Box, Button, Card, CardContent, Container, Typography, styled } from "@mui/material";
import OcrTemplatesTable from "./OcrTemplatesTable";
import { useContext, useEffect, useRef, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import CreateOcrTemplateModal from "./CreateOcrTemplateModal";
import OcrTargetRegion from "./OcrTargetRegion";
import { OcrTargetRegionJson } from "../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import Selecto, { OnSelectEnd } from "react-selecto";
import Moveable from "react-moveable";
import OcrTemplateEditor from "./OcrTemplateEditor";




export default function OcrTemplates() {

    const {
        ocrTemplates,
        activeOcrTemplate,
        addTargetRegion,
        removeTargetRegion,
        updateTargetRegion,
    } = useContext( OcrTemplatesContext );

    const [
        openCreateOcrTemplateModal,
        setOpenCreateOcrTemplateModal
    ] = useState(false);


    return <>
        <Card variant="elevation" sx={{ borderRadius: 4, userSelect: 'none', width: '100%' }}>

            <CreateOcrTemplateModal
                open={openCreateOcrTemplateModal}
                handleClose={ () => setOpenCreateOcrTemplateModal(false) }
            />

            <CardContent>
                <Container maxWidth='xl'>

                    <Box sx={{ flexGrow: 1, margin: 1, mb: 2 }}>

                        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }} m={2} ml={0} mr={0}>
                            <Typography gutterBottom variant="h6" component="div" margin={0} ml={0} mb={4}>
                                OCR Templates
                            </Typography>
                        </Box> */}

                        <Button variant="outlined"
                            onClick={ () => setOpenCreateOcrTemplateModal( true ) }
                            sx={{ mb: 2 }}
                        >
                            New Template
                        </Button>

                        <Box display='flex' justifyContent='center' flexDirection='column'>

                            <Typography
                                fontSize='1.75rem'
                                visibility={ activeOcrTemplate ? 'unset' : 'hidden' }
                                textAlign='center'
                            >
                                {activeOcrTemplate?.name}
                            </Typography>

                            <OcrTemplateEditor/>

                        </Box>

                        <OcrTemplatesTable templates={ocrTemplates} />

                    </Box>

                </Container>
            </CardContent>
        </Card>
    </>
}