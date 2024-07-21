import { Box, Button, Card, CardContent, Container, Divider, FormControlLabel, Grid, InputAdornment, Switch, SxProps, TextField, Theme, Typography, styled } from "@mui/material";
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
import OcrTemplateList from "./OcrTemplateList";
import { SettingsContext } from "../../context/settings.provider";
import { OverlayBehavior, OverlayOcrRegionVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";


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

    const [ ignoreKeyboardEvents, setIgnoreKeyboardEvents ] = useState< boolean >();

    const { activeSettingsPreset, updateActivePresetVisuals } = useContext( SettingsContext );
    const overlayRegionVisuals: OverlayOcrRegionVisuals = activeSettingsPreset?.overlay?.visuals.ocr_region;
    

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

    function updateOverlayOcrRegionVisuals( update: Partial< OverlayOcrRegionVisuals > ){

        console.log({ update })

        updateActivePresetVisuals({
            ocr_region: {
                ...activeSettingsPreset.overlay.visuals.ocr_region,
                ...update
            }
        });
    }

    useEffect( () => {
        console.log( activeSettingsPreset?.overlay.visuals.ocr_region );
    }, [activeSettingsPreset?.overlay.visuals.ocr_region] );
    

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
                    
                    <Divider sx={{ width: '100%', mt: 4, mb: 4 }}/>

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
                            No active OCR template
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

                            <Typography
                                fontStyle='italic'
                                mt={3}
                                color='#ff5858'
                                margin='auto'
                                sx={{
                                    display: ( activeOcrTemplate?.target_regions.length > 0 ?
                                                'none' : 'inherit' )
                                }}
                            >
                                Draw at least one OCR region to extract text!
                            </Typography>
                            <OcrTemplateEditor
                                ignoreKeyboard={
                                    ignoreKeyboardEvents ||
                                    openCreateOcrTemplateModal ||
                                    openEditOcrTemplateModal
                                }
                            />
                            
                            {/* This should be in the settings but will stay here for convenience */}
                            <FormControlLabel label='Show region borders in the overlay'
                                title='This helps you verify if the regions are correctly positioned'
                                sx={{ mt: 4 }}
                                control={
                                    <Switch
                                        checked={ Boolean( overlayRegionVisuals?.border_width ) }
                                        onChange={ ( event ) => {
                                            console.log( event.target.checked )

                                            console.log( Number( event.target.checked ) )

                                            updateOverlayOcrRegionVisuals({
                                                border_width: Number( event.target.checked )
                                            });
                                        }}
                                    /> 
                                }
                            />
                        </Box>
                    }

                    <Divider sx={{ width: '100%', mt: 4, mb: 4 }}/>

                    <Typography fontSize='1.25rem'>
                        Your templates
                    </Typography>

                    <OcrTemplateList
                        onSearchInputFocus={
                            () => setIgnoreKeyboardEvents(true)
                        }
                        onSearchInputBlur={
                            () => setIgnoreKeyboardEvents(false)
                        }
                    />

                </Box>

            </Container>
        </CardContent>
    </Card>
    )
}