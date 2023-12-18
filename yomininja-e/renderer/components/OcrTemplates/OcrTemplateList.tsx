import { Box, Grid, InputAdornment, TextField, Typography } from "@mui/material";
import { ChangeEvent, useContext, useState } from "react";
import AlertDialog from "../common/AlertDialog";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { OcrTemplateJson } from "../../../electron-src/@core/domain/ocr_template/ocr_template";
import OcrTemplateItem from "./OcrTemplateItem";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";


export default function OcrTemplateList() {

    const {
        ocrTemplates,
        activeOcrTemplate,
        loadOcrTemplate,
        deleteOcrTemplate,
    } = useContext( OcrTemplatesContext );

    const [ searchValue, setSearchValue ] = useState< string >('');
    const [ openDeleteDialog, setOpenDeleteDialog ] = useState<boolean>( false );
    const [ itemToDelete, setItemToDelete ] = useState< OcrTemplateJson | null >();

    const items = (
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
                            deleteItem={ () => {
                                setItemToDelete( item );
                                setOpenDeleteDialog( true );
                            }}
                        />
                    </Grid>
                )
            })
    );


    function handleDelete() {
        deleteOcrTemplate( itemToDelete?.id );
    }

    return ( <>
        <Box display='flex'
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            mt={2}
        >
            <AlertDialog
                title={'Confirm deletion'}
                message="This action cannot be undone!"
                okButtonText="Yes"
                cancelButtonText="No"
                open={ openDeleteDialog }
                handleCancel={ () => {
                    setOpenDeleteDialog( false );
                    setItemToDelete( null );
                }}
                handleOk={ handleDelete }
                handleClose={ () => setOpenDeleteDialog(false) }
            />
            
            <TextField type="search"
                placeholder="Search"
                value={searchValue}
                onChange={ (event: ChangeEvent< HTMLInputElement >) => {
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
                    // mt: 5,
                    mb: 2,
                }}
            />
            

            <Box display='flex'
                alignItems='center'
                sx={{ flexGrow: 1, margin: 1 }}
            >
                <Grid container display={'flex'}
                    spacing={{ xs: 2, md: 2 }}
                    columns={{ xs: 1, sm: 4, md: 12 }}
                >
                    { items }
                </Grid>
            </Box>
        </Box>
    </> )
}