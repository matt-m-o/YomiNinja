import { Box, Button, Card, CardContent, Container, Typography } from "@mui/material";
import OcrTemplatesTable from "./OcrTemplatesTable";
import { useContext, useRef, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import CreateOcrTemplateModal from "./CreateOcrTemplateModal";
import Moveable from "react-moveable";
import OcrTargetRegion from "./OcrTargetRegion";


export default function OcrTemplates() {

    const {
        ocrTemplates,
        activeOcrTemplate,
        addTargetRegion,
    } = useContext( OcrTemplatesContext );

    const [ openCreateOcrTemplateModal, setOpenCreateOcrTemplateModal ] = useState(false);
    

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

                        <Button
                            onClick={ () => addTargetRegion({
                                ocr_template_id: activeOcrTemplate.id,
                                position: {
                                    top: 0.25,
                                    left: 0.25,
                                },
                                size: {
                                    width: 0.25,
                                    height: 0.25,
                                },
                                angle: 0,
                            }) }
                        >
                            Add region
                        </Button>

                        <Box display='flex' justifyContent='center' flexDirection='column'>

                            <Typography visibility={ activeOcrTemplate ? 'unset' : 'hidden' }>
                                {activeOcrTemplate?.name}
                            </Typography>

                            { activeOcrTemplate &&
                                <div className='container'
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        overflow: 'hidden',
                                    }}>

                                    { activeOcrTemplate?.target_regions.map( region => {
                                        return <OcrTargetRegion key={region.id} region={region} />
                                    }) }
                                    

                                    <img src={ 'data:image/png;base64,' + activeOcrTemplate?.image_base64 }
                                        alt="template background image"
                                        draggable={false}
                                        style={{
                                            top: 0,
                                            left: 0,
                                            maxWidth: '100%',
                                            userSelect: 'none',
                                            objectFit: 'cover', 
                                        }}
                                    />
                                </div>
                                
                            }
                        </Box>

                        <OcrTemplatesTable templates={ocrTemplates} />

                    </Box>

                </Container>
            </CardContent>
        </Card>
    </>
}