import { Box, Button, Card, CardContent, Container, Divider, FormControlLabel, Grid, Switch, Typography, styled } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DictionaryImportModal from "./DictionaryImportModal";
import { useContext, useState } from "react";
import DictionariesTable from "./DictionariesTable";
import { DictionaryContext } from "../../context/dictionary.provider";
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import Image  from 'next/image';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { SettingsContext } from "../../context/settings.provider";

const SectionDivider = styled( Divider )({
    marginTop: '30px',
    marginBottom: '30px',
});

export default function Dictionary() {

    const [ openDictImportModal, setOpenDictImportModal ] = useState(false);
    const {
        installedDictionaries,
        installedExtensions,
        deleteAllDictionaries,
        openExtensionOptions
    } = useContext( DictionaryContext );

    const { activeSettingsPreset, updateActivePresetDictionary } = useContext( SettingsContext );
    const { dictionary } = activeSettingsPreset;
    
    
    const InstalledExtensions = (
        installedExtensions?.map( item => {
            return (
                <Button key={item.id} onClick={ () => openExtensionOptions( item ) } >
                    <Box display='flex' 
                        justifyContent='center'
                        alignItems='center'
                        maxWidth={300}
                    >
                        <Image
                            src={'data:image/png;base64,'+item.icon}
                            alt={item.name}
                            height={60}
                            width={60}
                        />
                        {item.name}

                        <MoreVertRoundedIcon sx={{ width: 'max-content', height: 35 }}/>
                        
                    </Box>
                </Button>
            )                            
        })
    )


    return (
        <Card variant="elevation" sx={{ borderRadius: 4, userSelect: 'none' }}>
            <DictionaryImportModal
                open={openDictImportModal}
                handleClose={ () => setOpenDictImportModal(false) }
            />

            <CardContent>
                <Container maxWidth='md'>                    

                    <Box sx={{ flexGrow: 1, margin: 1, mb: 2 }}>

                        <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                            Dictionary Extensions
                        </Typography>

                        <Typography gutterBottom component="div" margin={2} ml={0} mb={1}>
                            Popup dictionaries made for web browsers.
                        </Typography>

                        <Box display='flex' 
                            justifyContent='center'
                            alignItems='center'
                            mb={1}
                        >
                            <Box display='flex'       
                                alignItems='center'
                                sx={{ flexGrow: 1, margin: 1 }}
                            >
                                { InstalledExtensions }
                            </Box>
                            
                            <Box display='flex' 
                                alignItems='center'
                                flexDirection='column'                                
                            >
                                <Typography gutterBottom component="div" m={0} fontSize={'1.1rem'} pr={0}>
                                    Test the extension
                                </Typography>
                                <Typography gutterBottom component="div" m={0} fontSize={'1.75rem'} pr={0}>
                                    読み ・ 忍者
                                </Typography>
                            </Box>
                            
                            
                            
                        </Box>

                        
                        <Typography fontSize='1rem' lineHeight={2} mt='56px'>
                            Notes:
                        </Typography>                        
                        <ul
                            style={{
                                fontSize: '1rem',                                
                                lineHeight: 2,
                                marginTop: 0,
                                marginLeft: 5
                            }}
                        >
                            <li> Extension customizations take effect on the next launch. </li>
                            <li> Disable the Click-through to interact with the popup. </li>                            
                        </ul>

                    </Box>

                    <SectionDivider/>

                    <Box sx={{ flexGrow: 1, margin: 1 }}>

                        <Typography gutterBottom variant="h6" component="div" margin={2} ml={0}>
                            Yomi Ninja Dictionary (Experimental)
                        </Typography>

                        <Typography gutterBottom component="div" margin={2} ml={0} mb={1}>
                            This is an experimental popup dictionary made for YomiNinja.
                        </Typography>
                        <Typography gutterBottom component="div" margin={2} ml={0} mb={3}>
                            This feature is currently in an experimental stage of development. 
                            Please be aware that it may have bugs, limited functionality, or unexpected behavior. 
                            Is strongly recommend using it only for testing and providing feedback. <br/> 
                            Your feedback will help us improve this feature, so thank you for your support and understanding!
                        </Typography>

                        <FormControlLabel label='Enable Yomi Ninja dictionary'
                            control={
                                <Switch
                                    checked={ Boolean( dictionary?.enabled ) }
                                    onChange={ ( event ) => {
                                        updateActivePresetDictionary({
                                            enabled: event.target.checked
                                        });
                                    }}
                                /> 
                            }
                        />

                        <DictionariesTable dictionaries={installedDictionaries} />

                        <Grid container justifyContent="center" 
                            spacing={{ xs: 2, md: 2 }}
                            columns={{ xs: 1, sm: 4, md: 12 }}
                            sx={{ flexGrow: 1 }}
                        >
                    
                            <Grid item>
                                <Button variant="contained"
                                    startIcon={<AddRoundedIcon/>}
                                    onClick={ () => setOpenDictImportModal(true) }                                
                                >
                                    Import
                                </Button>
                            </Grid>

                            <Grid item>
                                <Button variant="contained"
                                    color='error'
                                    startIcon={<DeleteForeverRoundedIcon/>}
                                    onClick={ () => deleteAllDictionaries() }
                                >
                                    Delete all
                                </Button>
                            </Grid>
                            
                        </Grid>
                        
                    </Box>


                </Container>
            </CardContent>
            
        </Card>
    )
}