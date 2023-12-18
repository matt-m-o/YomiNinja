import { Box, Button, Card, CardContent, Container, Divider, Grid, InputAdornment, SxProps, TextField, Theme, Typography, styled } from "@mui/material";
import OcrTemplatesTable from "./OcrTemplatesTable";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import CreateOcrTemplateModal from "./CreateOcrTemplateModal";
import OcrTemplateEditor from "./OcrTemplateEditor";
import ModeEditOutlineRoundedIcon from '@mui/icons-material/ModeEditOutlineRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import OcrTemplateItem from "./OcrTemplateItem";
import EditOcrTemplateModal from "./EditOcrTemplateModal";
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import AlertDialog from "../common/AlertDialog";
import OcrTemplateList from "./OcrTemplateList";


const TemplateActionBtn = styled( Button )({
    minWidth:'fit-content',
    padding: 5,
    marginLeft: 2,
    marginBottom: 2
});


export default function OcrTemplates() {

    const {
        ocrTemplates,
        activeOcrTemplate,
        loadOcrTemplate,
        unloadOcrTemplate,
        deleteOcrTemplate,
    } = useContext( OcrTemplatesContext );

    const [
        openCreateOcrTemplateModal,
        setOpenCreateOcrTemplateModal
    ] = useState(false);

    const [
        openEditOcrTemplateModal,
        setOpenEditOcrTemplateModal
    ] = useState(false);

    const displaySearch = ocrTemplates?.length > 0;


    const iconStyle: CSSProperties = {
        width: '28px',
        height: '28px',
        margin: 1,
        marginRight: 1,
        marginLeft: 1,
    };

    const actionButtonSx: SxProps< Theme > = {
        m: 0.5,
        borderRadius: '100px'
    };

    

    return (
    <Card variant="elevation" sx={{ borderRadius: 4, userSelect: 'none', width: '100%' }}>

        { openCreateOcrTemplateModal &&
            <CreateOcrTemplateModal
                open={openCreateOcrTemplateModal}
                handleClose={ () => setOpenCreateOcrTemplateModal(false) }
            />
        }

        { openEditOcrTemplateModal &&
            <EditOcrTemplateModal
                template={ activeOcrTemplate }
                open={ openEditOcrTemplateModal }
                handleClose={ () => setOpenEditOcrTemplateModal(false) }
            />
        }

        <CardContent>
            <Container maxWidth='xl' sx={{ p: 0 }}>

                <Box sx={{ flexGrow: 1, margin: 1, mb: 2 }}>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }} m={0}>
                        <Typography gutterBottom variant="h6" component="div" margin={0} ml={0} mb={2}>
                            Manually Defined OCR Regions for Targeted Text Extraction
                        </Typography>

                        <Button variant="outlined"
                            onClick={ () => setOpenCreateOcrTemplateModal( true ) }
                            sx={{
                                ...actionButtonSx,
                                borderRadius: undefined
                            }}
                            startIcon={
                                <AddRoundedIcon style={{
                                    ...iconStyle,
                                    marginLeft: 0,
                                    marginRight: 0
                                }}/>
                            }
                        >
                            New Template
                        </Button>
                    </Box>
                    
                    <Divider sx={{ width: '100%', mt: 4 }}/>
                    <Typography
                        fontSize='1.25rem'
                        // visibility={ activeOcrTemplate ? 'unset' : 'hidden' }
                        mr={1}
                        mt={2}
                    >
                        Active template
                    </Typography>

                    { !activeOcrTemplate &&
                        <Typography
                            textAlign='center'
                            fontStyle='italic'
                            mt={3}
                        >
                            There is no active OCR Template
                        </Typography>
                    }
                    
                    { activeOcrTemplate &&

                        <Box display='flex' flexDirection='column'
                            sx={{
                                width: 'fit-content',
                                margin: 'auto',
                            }}
                        >
                            <Box display='flex'
                                flexDirection='row'
                                alignItems='center'
                                justifyContent='center'
                                mb={1}
                            >
                                <Typography
                                    title='Active OCR Template'
                                    fontSize='1.75rem'
                                    visibility={ activeOcrTemplate ? 'unset' : 'hidden' }
                                    mr={1}
                                    color='#90caf9'
                                >
                                    {activeOcrTemplate?.name}
                                </Typography>
                                
                                <Box>
                                    <TemplateActionBtn variant="outlined"
                                        onClick={ () => setOpenEditOcrTemplateModal( true ) }
                                        title='Edit OCR Template'
                                        sx={actionButtonSx}
                                    >
                                        <MoreVertRoundedIcon style={iconStyle}/>
                                    </TemplateActionBtn>

                                    <TemplateActionBtn variant="outlined"
                                        onClick={ () => unloadOcrTemplate() }
                                        title='Unload OCR Template'
                                        // color="error"
                                        sx={actionButtonSx}
                                    >
                                        <CloseRoundedIcon style={iconStyle} />
                                    </TemplateActionBtn>
                                </Box>
                            </Box>
                            <OcrTemplateEditor/>
                        </Box>
                    }

                    <Divider sx={{ width: '100%', mt: 4 }}/>
                    <Typography
                        fontSize='1.25rem'
                        mr={1}
                        mt={2}
                    >
                        Your templates
                    </Typography>
                    <OcrTemplateList/>

                </Box>

            </Container>
        </CardContent>
    </Card>
    )
}