import { Box, Button, Card, CardContent, Container, Grid, InputAdornment, SxProps, TextField, Theme, Typography, styled } from "@mui/material";
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
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';


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

    const [ searchValue, setSearchValue ] = useState< string >('');

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

    const ocrTemplateItems = (
        ocrTemplates?.filter(
                item => item.name.toLowerCase().includes( searchValue.toLowerCase() )
            )
            .map( item => {
                return (
                    <Grid item key={item.id}>
                        <OcrTemplateItem
                            isActive={ item.id === activeOcrTemplate?.id }
                            template={ item }
                            loadItem={ () => loadOcrTemplate( item.id ) }
                            editItem={ () => {} }
                            deleteItem={ () => deleteOcrTemplate( item.id ) }
                        />
                    </Grid>
                )
            })
    );

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
                            Predefine regions to improve OCR efficiency
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
                        
                    { !displaySearch &&
                        <Typography
                            textAlign='center'
                            fontStyle='italic'
                            mt={5}
                        >
                            Create a new OCR Template to get started
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

                    <Box display='flex'
                        flexDirection='column'
                        justifyContent='center'
                        alignItems='center'
                        mt={4}
                        mb={1}
                    >
                        { displaySearch &&
                            <TextField type="search"
                                placeholder="Search"
                                value={searchValue}
                                onChange={ (event: React.ChangeEvent<HTMLInputElement>) => {
                                    setSearchValue( event.target.value );
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                        <SearchRoundedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: '100%',
                                    minWidth: '25vw',
                                    maxWidth: '500px',
                                    mt: 5,
                                    mb: 2,
                                }}
                            />
                        }

                        <Box display='flex'
                            alignItems='center'
                            sx={{ flexGrow: 1, margin: 1 }}
                        >
                            <Grid container display={'flex'}
                                spacing={{ xs: 2, md: 2 }}
                                columns={{ xs: 1, sm: 4, md: 12 }}
                            >
                                { ocrTemplateItems }
                            </Grid>
                        </Box>
                    </Box>

                </Box>

            </Container>
        </CardContent>
    </Card>
    )
}