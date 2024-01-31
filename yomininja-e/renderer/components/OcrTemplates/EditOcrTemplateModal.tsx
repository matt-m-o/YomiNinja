import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, TextField, Typography, styled } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import { OcrTemplate, OcrTemplateJson } from "../../../electron-src/@core/domain/ocr_template/ocr_template";
import { CaptureSourceContext } from "../../context/capture_source.provider";
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'max-content',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3,
};

  
export type EditOcrTemplateModalProps = {
    template: OcrTemplateJson;
    open: boolean;
    handleClose: () => void;
};

export default function EditOcrTemplateModal( props: EditOcrTemplateModalProps ) {

    const { template, open } = props;

    const [ name, setName ] = useState< string >('');
    const [ image, setImage ] = useState< Buffer >();

    const [ savingHasFailed, setSavingHasFailed ] = useState< boolean >( false );

    const canSave = !Boolean( name );

    const {
        updateOcrTemplate,
        loadOcrTemplate,
    } = useContext( OcrTemplatesContext );
    const {
        captureSourceImage,
        captureSourceImageBase64,
        clearCaptureSourceImage
    } = useContext( CaptureSourceContext );

    useEffect( () => {

        if ( !template )
            return;

        // console.log( template.image );

        setName( template.name );
        setImage( template.image );
    }, [ template ] );

    
    useEffect( () => {
        setEditingState( open );
    }, [ open ]);

    useEffect( () => {
        setImage( captureSourceImage );
        // console.log({ captureSourceImage })
    }, [ captureSourceImage ] );

    async function saveOcrTemplate() {

        const updatedTemplate = await updateOcrTemplate({
            ...template,
            image,
            name,
        });

        if ( !updatedTemplate ) {
            setSavingHasFailed( true );
            return;
        }

        loadOcrTemplate( updatedTemplate.id );
        handleClose();
    }

    function setEditingState( isEditing: boolean ) {
        global.ipcRenderer.invoke( 'app:editing_ocr_template', isEditing );
    }

    function handleNameChange( newName: string ) {
        setName( newName );
        if ( savingHasFailed )
            setSavingHasFailed( false );
    }

    function handleClose() {
        props.handleClose();
        clearCaptureSourceImage();
        setEditingState( false );
    }

    const base64Image = captureSourceImageBase64 || template?.image_base64;

    return (
        <Modal open={open}
            style={{
                zIndex: 4000,
            }}
        >
            <Box sx={style}>
                <Typography variant="h6" component="h2" mb={4}>
                    Edit OCR Template
                </Typography>
                
                <TextField
                    label="Name"
                    required
                    value={ name }
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        handleNameChange( event.target.value );
                    }}
                    sx={{ width: '100%' }}
                />
                { savingHasFailed &&
                    <Typography mt={0} mb={2}
                        color='#ff5858'
                        fontSize='1.1rem'
                    >
                        Template name already exists!
                    </Typography>
                }


                <Box display='flex' justifyContent='center' flexDirection='column'>
                    <Typography align="center" mt={4} mb={2}
                        color='#90caf9'
                        fontSize='1.1rem'
                    >
                        Press the OCR hotkey to set the template dimensions and background
                    </Typography>

                    { base64Image &&
                        <img
                            src={ 'data:image/png;base64,'+ base64Image }
                            alt="capture source image"
                            style={{
                                // maxWidth: '50%',
                                maxHeight: '50vh',
                                userSelect: 'none',
                                objectFit: 'cover',
                                margin: 'auto',
                                border: 'solid 1px #90caf9'
                            }}
                        />
                    }
                </Box>


                <Box display='flex' justifyContent='end' mt={4}>
                    <Button variant='contained' size="medium"
                        disabled={ canSave }
                        sx={{ m: 1 }}
                        onClick={ saveOcrTemplate }
                    >
                        Save
                    </Button>
                    <Button variant='outlined' size="medium"
                        sx={{ m: 1, backgroundColor: '' }}
                        onClick={ handleClose }
                    >
                        Cancel
                    </Button>
                </Box>

            </Box>
        </Modal>
    )
}