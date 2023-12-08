import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, TextField, Typography, styled } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3,
};

  
export type CreateOcrTemplateModalProps = {
    open: boolean;
    handleClose: () => void;
};

export default function CreateOcrTemplateModal( props: CreateOcrTemplateModalProps ) {

    const { open, handleClose } = props;

    const [ name, setName ] = useState< string >('');
    const [ image, setImage ] = useState< Buffer >();

    const { createOcrTemplate } = useContext( OcrTemplatesContext );

    function saveOcrTemplate() {

        // save
        // .....

        handleClose();
    }

    return (
        <Modal open={open}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" mb={4}>
                    New OCR Template
                </Typography>
                
                <TextField
                    label="Name"
                    required
                    value={ name }
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setName(event.target.value);
                    }}
                    sx={{ width: '100%' }}
                />


                <Box>
                    <Typography align="center" mt={4}>
                        Press the OCR hotkey to set the capture source dimensions
                    </Typography>
                    
                    
                </Box>


                <Box display='flex' justifyContent='end' mt={4}>
                    <Button variant='contained' size="medium"
                        disabled={ !Boolean( name && image ) }
                        sx={{ m: 1 }}
                        onClick={ saveOcrTemplate }
                    >
                        Save
                    </Button>
                    <Button variant='outlined' size="medium"
                        sx={{ m: 1, backgroundColor: '' }}
                        onClick={ handleClose }
                    >
                        Close
                    </Button>
                </Box>

            </Box>
        </Modal>
    )
}